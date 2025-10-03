import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { EmployeeInputType, employeeSchemaZod } from "../validations/employee.validation";
import AppError from "../utils/AppError";
import Employee from "../models/employeeModel";
import DailyOperation from "../models/dailyOperationModel";
import catchAsync from "../utils/catchAsync";

const getOrganizationTotals = async (organizationId: mongoose.Types.ObjectId) => {
  const employees = await Employee.find({ organization: organizationId }, "_id requestedAmount");

  const requestedAmounts: Record<string, number> = {};
  employees.forEach((emp) => {
    requestedAmounts[emp._id.toString()] = emp.requestedAmount || 0;
  });

  const totalsMap = await getEmployeeTotals(
    employees.map((emp) => emp._id as mongoose.Types.ObjectId),
    requestedAmounts
  );

  return employees.reduce(
    (acc, emp) => {
      const totals = totalsMap.get(emp._id.toString()) || {
        totalRevenue: 0,
        totalExpenses: 0,
        revenueRemaining: 0,
        remaining: emp.requestedAmount || 0,
      };

      acc.totalRequested += emp.requestedAmount || 0;
      acc.totalRevenue += totals.totalRevenue || 0;
      acc.totalExpenses += totals.totalExpenses || 0;
      acc.totalRevenueRemaining += totals.revenueRemaining || 0;
      acc.totalRemaining += totals.remaining || 0;
      return acc;
    },
    {
      totalRequested: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      totalRevenueRemaining: 0,
      totalRemaining: 0,
    }
  );
};


// 🔹 Helper: calculate totals for employees
const getEmployeeTotals = async (
  employeeIds: mongoose.Types.ObjectId[],
  requestedAmounts?: Record<string, number>
) => {
  const totals = await DailyOperation.aggregate([
    { $match: { employee: { $in: employeeIds } } },
    {
      $group: {
        _id: "$employee",
        totalRevenue: {
          $sum: { $cond: [{ $eq: ["$category", "revenue"] }, "$amount", 0] },
        },
        totalExpenses: {
          $sum: { $cond: [{ $eq: ["$category", "expense"] }, "$amount", 0] },
        },
      },
    },
  ]);

  const map = new Map();
  totals.forEach((t) => {
    const requested = requestedAmounts?.[t._id.toString()] || 0;
    map.set(t._id.toString(), {
      totalRevenue: t.totalRevenue,
      totalExpenses: t.totalExpenses,
      revenueRemaining: t.totalRevenue - t.totalExpenses,
      remaining: requested - t.totalRevenue,
    });
  });

  return map;
};

const createEmployee = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = employeeSchemaZod.safeParse(req.body);
  if (!result.success) {
    return next(new AppError(result.error.message, 400));
  }

  const employeeData = result.data;
  const employee = await (await Employee.create(employeeData)).populate("organization", "ownerName");

  // Totals
  const requestedAmount = employee.requestedAmount || 0;
  const totalsMap = await getEmployeeTotals([employee._id as mongoose.Types.ObjectId], {
    [employee._id.toString()]: requestedAmount,
  });
  const totals = totalsMap.get(employee._id.toString()) || {
    totalRevenue: 0,
    totalExpenses: 0,
    revenueRemaining: 0,
    remaining: requestedAmount,
  };

  res.status(201).json({
    status: "success",
    data: { employee: { ...employee.toObject(), ...totals } },
  });
});

const updateEmployee = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new AppError("Invalid employee ID format", 400));
  }

  const updateEmployeeSchema = employeeSchemaZod.partial();

  const result = updateEmployeeSchema.safeParse(req.body);
  if (!result.success) {
    return next(new AppError(result.error.message, 400));
  }

  const employeeData: Partial<EmployeeInputType> = result.data;
  const employee = await Employee.findByIdAndUpdate(id, employeeData, {
    new: true,
    runValidators: true,
  }).populate("organization", "ownerName");

  if (!employee) {
    return next(new AppError("No employee found with that ID", 404));
  }

  // Totals
  const requestedAmount = employee.requestedAmount || 0;
  const totalsMap = await getEmployeeTotals([employee._id as mongoose.Types.ObjectId], {
    [employee._id.toString()]: requestedAmount,
  });
  const totals = totalsMap.get(employee._id.toString()) || {
    totalRevenue: 0,
    totalExpenses: 0,
    revenueRemaining: 0,
    remaining: requestedAmount,
  };

  res.status(200).json({
    status: "success",
    data: { employee: { ...employee.toObject(), ...totals } },
  });
});

const deleteEmployee = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new AppError("Invalid employee ID format", 400));
  }

  const employee = await Employee.findByIdAndDelete(id);
  if (!employee) {
    return next(new AppError("No employee found with that ID", 404));
  }

  res.status(204).json({ status: "success", data: null });
});

const getAllEmployees = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
  const skip = (page - 1) * limit;

  const search = req.query.search ? String(req.query.search).trim() : null;
    const filter: any = {
      };
      if (search) {
        filter.$or = [
          {name: { $regex: search, $options: "i" } },
          {residencePermitNumber: { $regex: search, $options: "i" } }
        ] 
      }

  const totalEmployees = await Employee.countDocuments(filter);
  const employees = await Employee.find(filter, "-__v")
    .skip(skip)
    .limit(limit)
    .populate("organization", "ownerName");

  const requestedAmounts: Record<string, number> = {};
  employees.forEach((emp) => {
    requestedAmounts[emp._id.toString()] = emp.requestedAmount || 0;
  });


  const totalPages = Math.ceil(totalEmployees / limit);

  res.status(200).json({
    status: "success",
    results: employees.length,
    pagination: {
      total: totalEmployees,
      page,
      limit,
      totalPages,
      next: page < totalPages ? page + 1 : null,
      previous: page > 1 ? page - 1 : null,
    },
    data: { employees: employees },
  });
});

const getEmployee = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new AppError("Invalid employee ID format", 400));
  }

  const employee = await Employee.findById(id).populate("organization", "ownerName");
  if (!employee) {
    return next(new AppError("No employee found with that ID", 404));
  }

  const requestedAmount = employee.requestedAmount || 0;
  const totalsMap = await getEmployeeTotals([employee._id as mongoose.Types.ObjectId], {
    [employee._id.toString()]: requestedAmount,
  });
  const totals = totalsMap.get(employee._id.toString()) || {
    totalRevenue: 0,
    totalExpenses: 0,
    revenueRemaining: 0,
    remaining: requestedAmount,
  };

  res.status(200).json({
    status: "success",
    data: { employee: { ...employee.toObject(), ...totals } },
  });
});

const getAllOrgizationEmployees = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const skip = (page - 1) * limit;
  
      const { id } = req.params;
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid organization ID format", 400));
      }


      const search = req.query.search ? String(req.query.search).trim() : null;
      const filter: any = {
         organization: id ,
      };
      if (search) {
        filter.$or = [
          {name: { $regex: search, $options: "i" } },
          {residencePermitNumber: { $regex: search, $options: "i" } }
        ] 
      }
  
      const totalEmployees = await Employee.countDocuments(filter);
      const employees = await Employee.find(filter, "-__v")
        .skip(skip)
        .limit(limit);
  
      const requestedAmounts: Record<string, number> = {};
      employees.forEach((emp) => {
        requestedAmounts[emp._id.toString()] = emp.requestedAmount || 0;
      });
  
      const totalsMap = await getEmployeeTotals(
        employees.map((emp) => emp._id as mongoose.Types.ObjectId),
        requestedAmounts
      );
  
      const enrichedEmployees = employees.map((emp) => {
        const totals = totalsMap.get(emp._id.toString()) || {
          totalRevenue: 0,
          totalExpenses: 0,
          revenueRemaining: 0,
          remaining: emp.requestedAmount || 0,
        };
        return {
          ...emp.toObject(),
          ...totals,
        };
      });
  
  
      const totalPages = Math.ceil(totalEmployees / limit);
  
      res.status(200).json({
        status: "success",
        results: employees.length,
        pagination: {
          total: totalEmployees,
          page,
          limit,
          totalPages,
          next: page < totalPages ? page + 1 : null,
          previous: page > 1 ? page - 1 : null,
        },
         
        data: { employees: enrichedEmployees },
      });
    }
);

const getOrgEmployeesTotals = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError("Invalid organization ID format", 400));
    }

    const totals = await getOrganizationTotals(new mongoose.Types.ObjectId(id));

    res.status(200).json({
      status: "success",
      data: { totals },
    });
  }
);

const getOrgEmployeesCount = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError("Invalid organization ID format", 400));
    }

    const count = await Employee.countDocuments({ organization: id });

    res.status(200).json({
      status: "success",
      data: { count },
    });
  }
);

const getEmployeesWithExpiredResidence = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const skip = (page - 1) * limit;
  
      const today = new Date();

      const search = req.query.search ? String(req.query.search).trim() : null;
      const filter: any = {
        residencePermitExpiry: { $lte: today },
      };
      if (search) {
        filter.$or = [
          {name: { $regex: search, $options: "i" } },
          {residencePermitNumber: { $regex: search, $options: "i" } }
        ] 
      }
  
  
      const totalEmployees = await Employee.countDocuments(filter);
  
      const employees = await Employee.find(filter)
        .sort({ residencePermitExpiry: -1 }) 
        .skip(skip)
        .limit(limit)
        .select("-__v");
  
  
  
      const totalPages = Math.ceil(totalEmployees / limit);
  
      res.status(200).json({
        status: "success",
        results: employees.length,
        pagination: {
          total: totalEmployees,
          page,
          limit,
          totalPages,
          next: page < totalPages ? page + 1 : null,
          previous: page > 1 ? page - 1 : null,
        },
        data: {
          employees,
        },
      });
    }
);


const getEmployeesExpiringSoon = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const skip = (page - 1) * limit;

    
  
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);

      const search = req.query.search ? String(req.query.search).trim() : null;
      const filter: any = {
        residencePermitExpiry: { $gt: today, $lte: thirtyDaysLater },
      };
      if (search) {
        filter.$or = [
          {name: { $regex: search, $options: "i" } },
          {residencePermitNumber: { $regex: search, $options: "i" } }
        ] 
      }
  
      const totalEmployees = await Employee.countDocuments(filter);
  
      const employees = await Employee.find(filter)
        .sort({ residencePermitExpiry: 1 })
        .skip(skip)
        .limit(limit)
        .select("-__v");
  
     
  
      const totalPages = Math.ceil(totalEmployees / limit);
  
      res.status(200).json({
        status: "success",
        results: employees.length,
        pagination: {
          total: totalEmployees,
          page,
          limit,
          totalPages,
          next: page < totalPages ? page + 1 : null,
          previous: page > 1 ? page - 1 : null,
        },
        data: {
          employees,
        },
      });
    }
);
  
  


  
  

export default {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAllEmployees,
  getEmployee,
  getAllOrgizationEmployees,
  getEmployeesWithExpiredResidence,
  getEmployeesExpiringSoon,
  getOrgEmployeesTotals,
  getOrgEmployeesCount,
};
