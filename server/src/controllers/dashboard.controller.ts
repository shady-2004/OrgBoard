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
    // Count total organizations
    const totalOrganizations = await Organization.countDocuments();

    // Count total employees across all organizations
    const totalEmployees = await Employee.countDocuments();

    // Count total daily operations (employee operations)
    const dailyOperations = await DailyOperation.countDocuments();

    // Count active users
    const activeUsers = await User.countDocuments({ active: true });

    // Count total office operations
    const officeOperations = await OfficeOperation.countDocuments();

    // Get employees with expired residence permits
    const expiredEmployees = await Employee.countDocuments({
      residencePermitExpiry: { $lt: new Date() },
    });

    // Get employees with residence permits expiring in next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const nearlyExpiredEmployees = await Employee.countDocuments({
      residencePermitExpiry: { 
        $gt: new Date(),
        $lte: thirtyDaysFromNow 
      },
    });

    // Employee financial insights - get all employees and their requested amounts
    const allEmployees = await Employee.find({}, "_id requestedAmount");
    
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
    const dailyOpsFinancials = await DailyOperation.aggregate([
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
    const officeOpsFinancials = await OfficeOperation.aggregate([
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
    const recentEmployees = await Employee.find()
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
