import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";
import Organization from "../models/organizationModel";
import DailyOperation from "../models/dailyOperationModel";
import User from "../models/usersModel";
import OfficeOperation from "../models/officeOperationModel";
import Employee from "../models/employeeModel";
import mongoose from "mongoose";

// Get dashboard statistics
export const getDashboardStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get optional month and year filters from query params
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

    // Build date filter for operations if month/year provided
    let dateFilter: any = {};
    if (month && year) {
      // Filter for specific month and year
      const startDate = new Date(year, month - 1, 1); // month is 1-based in query, 0-based in Date
      const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of month
      dateFilter = { $gte: startDate, $lte: endDate };
    } else if (year) {
      // Filter for entire year
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      dateFilter = { $gte: startDate, $lte: endDate };
    }

    // Count total organizations
    const totalOrganizations = await Organization.countDocuments();

    // Count total employees (only type: 'employee', not vacancies)
    const totalEmployees = await Employee.countDocuments({ type: 'employee' });

    // Count total vacancies (type: 'vacancy')
    const totalVacancies = await Employee.countDocuments({ type: 'vacancy' });

    // Calculate available vacancy slots across all organizations
    // Formula: (4 * number of organizations) - total employees
    const maxEmployeesPerOrg = 4;
    const totalAvailableSlots = Math.max(0, (maxEmployeesPerOrg * totalOrganizations) - totalEmployees);

    // Count total daily operations (employee operations)
    const dailyOperations = await DailyOperation.countDocuments();

    // Count active users
    const activeUsers = await User.countDocuments({ active: true });

    // Count total office operations
    const officeOperations = await OfficeOperation.countDocuments();

    // Get employees with expired residence permits (only employees, not vacancies)
    const expiredEmployees = await Employee.countDocuments({
      type: 'employee',
      residencePermitExpiry: { $lt: new Date() },
    });

    // Get employees with residence permits expiring in next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const nearlyExpiredEmployees = await Employee.countDocuments({
      type: 'employee',
      residencePermitExpiry: { 
        $gt: new Date(),
        $lte: thirtyDaysFromNow 
      },
    });

    // Employee financial insights - get all employees (not vacancies) and their requested amounts
    const allEmployees = await Employee.find({ type: 'employee' }, "_id requestedAmount");
    
    const employeeIds = allEmployees.map(emp => emp._id as mongoose.Types.ObjectId);
    const totalRequestedAmount = allEmployees.reduce((sum, emp) => sum + (emp.requestedAmount || 0), 0);

    // Get daily operations totals for all employees
    const dailyOpsTotals = await DailyOperation.aggregate([
      {
        $match: { employee: { $in: employeeIds } },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $cond: [{ $eq: ["$category", "revenue"] }, "$amount", 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ["$category", "expense"] }, "$amount", 0] },
          },
        },
      },
    ]);

    const employeeRevenue = dailyOpsTotals[0]?.totalRevenue || 0;
    const employeePaid = dailyOpsTotals[0]?.totalExpenses || 0;
    const employeeRemaining = totalRequestedAmount - employeeRevenue;

    // Daily operations financial insights - use same structure as employee totals
    // Daily operations use 'amount' and 'category' fields
    const dailyOpsMatch: any = {};
    if (Object.keys(dateFilter).length > 0) {
      dailyOpsMatch.date = dateFilter;
    }

    const dailyOpsFinancials = await DailyOperation.aggregate([
      ...(Object.keys(dailyOpsMatch).length > 0 ? [{ $match: dailyOpsMatch }] : []),
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $cond: [{ $eq: ["$category", "revenue"] }, "$amount", 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ["$category", "expense"] }, "$amount", 0] },
          },
        },
      },
    ]);

    // Office operations financial insights
    const officeOpsMatch: any = {};
    if (Object.keys(dateFilter).length > 0) {
      officeOpsMatch.date = dateFilter;
    }

    const officeOpsFinancials = await OfficeOperation.aggregate([
      ...(Object.keys(officeOpsMatch).length > 0 ? [{ $match: officeOpsMatch }] : []),
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const officeRevenue = officeOpsFinancials.find(op => op._id === 'revenue')?.total || 0;
    const officeExpenses = officeOpsFinancials.find(op => op._id === 'expense')?.total || 0;

    res.status(200).json({
      status: "success",
      data: {
        totalOrganizations,
        totalEmployees,
        totalVacancies,
        totalAvailableSlots,
        dailyOperations,
        activeUsers,
        officeOperations,
        expiredEmployees,
        nearlyExpiredEmployees,
        employeeFinancials: {
          totalRequestedAmount,
          totalRevenue: employeeRevenue,
          totalPaid: employeePaid,
          totalRemaining: employeeRemaining,
        },
        dailyOperationsFinancials: {
          totalRevenue: dailyOpsFinancials[0]?.totalRevenue || 0,
          totalExpenses: dailyOpsFinancials[0]?.totalExpenses || 0,
          net: (dailyOpsFinancials[0]?.totalRevenue || 0) - (dailyOpsFinancials[0]?.totalExpenses || 0),
        },
        officeOperationsFinancials: {
          totalRevenue: officeRevenue,
          totalExpenses: officeExpenses,
          net: officeRevenue - officeExpenses,
        },
      },
    });
  }
);

// Get office operations financial statistics with optional filters
export const getOfficeOperationsFinancials = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

    let dateFilter: any = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      dateFilter = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      dateFilter = { $gte: startDate, $lte: endDate };
    }

    const officeOpsMatch: any = {};
    if (Object.keys(dateFilter).length > 0) {
      officeOpsMatch.date = dateFilter;
    }

    const officeOpsFinancials = await OfficeOperation.aggregate([
      ...(Object.keys(officeOpsMatch).length > 0 ? [{ $match: officeOpsMatch }] : []),
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const officeRevenue = officeOpsFinancials.find(op => op._id === 'revenue')?.total || 0;
    const officeExpenses = officeOpsFinancials.find(op => op._id === 'expense')?.total || 0;

    res.status(200).json({
      status: "success",
      data: {
        totalRevenue: officeRevenue,
        totalExpenses: officeExpenses,
        net: officeRevenue - officeExpenses,
        filters: { month, year }
      },
    });
  }
);

// Get daily operations financial statistics with optional filters
export const getDailyOperationsFinancials = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

    let dateFilter: any = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      dateFilter = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      dateFilter = { $gte: startDate, $lte: endDate };
    }

    const dailyOpsMatch: any = {};
    if (Object.keys(dateFilter).length > 0) {
      dailyOpsMatch.date = dateFilter;
    }

    const dailyOpsFinancials = await DailyOperation.aggregate([
      ...(Object.keys(dailyOpsMatch).length > 0 ? [{ $match: dailyOpsMatch }] : []),
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $cond: [{ $eq: ["$category", "revenue"] }, "$amount", 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ["$category", "expense"] }, "$amount", 0] },
          },
          totalOperations: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        totalRevenue: dailyOpsFinancials[0]?.totalRevenue || 0,
        totalExpenses: dailyOpsFinancials[0]?.totalExpenses || 0,
        totalOperations: dailyOpsFinancials[0]?.totalOperations || 0,
        net: (dailyOpsFinancials[0]?.totalRevenue || 0) - (dailyOpsFinancials[0]?.totalExpenses || 0),
        filters: { month, year }
      },
    });
  }
);

// Note: Using existing employee routes for expired and nearly expired
// GET /employees/residence/expired
// GET /employees/residence/expiring-soon

// Get chart data for organizations trend
export const getOrganizationsTrend = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trend = await Organization.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: { trend },
    });
  }
);

// Get chart data for office operations (last 6 months)
export const getOfficeOperationsTrend = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trend = await OfficeOperation.aggregate([
      {
        $match: {
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: { trend },
    });
  }
);

// Get recent activities
export const getRecentActivities = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 10;

    // Get recent organizations
    const recentOrganizations = await Organization.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('ownerName createdAt');

    // Get recent employees
    const recentEmployees = await Employee.find({ type: 'employee' })
      .populate('organization', 'ownerName')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name organization createdAt');

    // Get recent vacancies
    const recentVacancies = await Employee.find({ type: 'vacancy' })
      .populate('organization', 'ownerName')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name organization createdAt');

    // Get recent office operations
    const recentOfficeOps = await OfficeOperation.find()
      .sort({ date: -1 })
      .limit(5)
      .select('type amount date');

    // Combine and format activities
    const activities = [
      ...recentOrganizations.map(org => ({
        type: 'organization',
        icon: '🏢',
        title: 'منظمة جديدة',
        description: org.ownerName,
        createdAt: (org as any).createdAt,
      })),
      ...recentEmployees.map(emp => ({
        type: 'employee',
        icon: '👤',
        title: 'موظف جديد',
        description: `${emp.name} - ${(emp.organization as any)?.ownerName || 'غير محدد'}`,
        createdAt: (emp as any).createdAt,
      })),
      ...recentVacancies.map(vac => ({
        type: 'vacancy',
        icon: '📋',
        title: 'شاغر وظيفي جديد',
        description: `${vac.name} - ${(vac.organization as any)?.ownerName || 'غير محدد'}`,
        createdAt: (vac as any).createdAt,
      })),
      ...recentOfficeOps.map(op => ({
        type: 'officeOperation',
        icon: op.type === 'expense' ? '💸' : '💰',
        title: 'عملية مكتب',
        description: `${op.type === 'expense' ? 'مصروف' : 'إيراد'} - ${op.amount} ريال`,
        createdAt: op.date,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    res.status(200).json({
      status: "success",
      results: activities.length,
      data: { activities },
    });
  }
);
