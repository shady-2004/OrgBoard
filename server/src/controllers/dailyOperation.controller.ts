import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { dailyOperationSchemaZod } from "../validations/dailyOperation.validation";
import AppError from "../utils/AppError";
import DailyOperation from "../models/dailyOperationModel";
import Organization from "../models/organizationModel";
import Employee from "../models/employeeModel";
import mongoose from "mongoose";
const createDailyOperation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = dailyOperationSchemaZod.safeParse(req.body);

  if (!result.success) {
    return next(new AppError(result.error.issues.map(e => e.message).join(", "), 400));
  }

  const dailyOperationData = result.data;

  // Ensure Organization exists
  const orgExists = await Organization.findById(dailyOperationData.organization);
  if (!orgExists) {
    return next(new AppError("Organization does not exist", 404));
  }

  // Ensure Employee exists and belongs to that Organization
  const empExists = await Employee.findOne({
    _id: dailyOperationData.employee,
    organization: dailyOperationData.organization,
  });
  if (!empExists) {
    return next(new AppError("Employee does not belong to this Organization", 400));
  }

  // Create daily operation
  const dailyOperation = await DailyOperation.create(dailyOperationData);

  await dailyOperation.populate("organization", "ownerName");
  await dailyOperation.populate("employee", "name");

  res.status(201).json({
    status: "success",
    data: { dailyOperation },
  });
});



const deleteDailyOperation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid daily operation ID format", 400));
    }
    const dailyOperation = await DailyOperation.findByIdAndDelete(id);
    if (!dailyOperation) {
        return next(new AppError("No daily operation found with that ID", 404));
    }
    res.status(204).json({
        status: "success",
        data: null
    });
});

const updateDailyOperation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid daily operation ID format", 400));
    }
    const partialDailyOperationSchemaZod = dailyOperationSchemaZod.partial();
    const result = partialDailyOperationSchemaZod.safeParse(body);
    if (!result.success) {
        return next(new AppError(result.error.message, 400));
    }
    const dailyOperationData = result.data;
    const dailyOperation = await DailyOperation.findByIdAndUpdate(id, dailyOperationData, { new: true ,runValidators: true}).populate('organization','ownerName').populate('employee','name');
    if (!dailyOperation) {
        return next(new AppError("No daily operation found with that ID", 404));
    }
   
    res.status(200).json({
        status: "success",
        data: {
            dailyOperation
        }
    });
})

const getAllDailyOperations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
  const skip = (page - 1) * limit;

  const { startDate, endDate, organizationName, employeeName } = req.query;

  // Build match conditions
  const match: any = {};
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate as string);
    if (endDate) match.date.$lte = new Date(endDate as string);
  }

  const aggregatePipeline: any[] = [
    { $match: match },

    // Lookup organization
    {
      $lookup: {
        from: "organizations",
        localField: "organization",
        foreignField: "_id",
        as: "organization",
      },
    },
    { $unwind: "$organization" },

    // Lookup employee
    {
      $lookup: {
        from: "employees",
        localField: "employee",
        foreignField: "_id",
        as: "employee",
      },
    },
    { $unwind: "$employee" },

    // Pick only needed fields
    {
      $project: {
        date: 1,
        amount: 1,
        category: 1,
        paymentMethod: 1,
        invoice: 1,
        notes: 1,
        "organization.ownerName": 1,
        "employee.name": 1,
      },
    },
  ];

  // Add optional regex filters
  const nameFilters: any[] = [];
  if (organizationName) {
    nameFilters.push({
      "organization.ownerName": { $regex: organizationName, $options: "i" },
    });
  }
  if (employeeName) {
    nameFilters.push({
      "employee.name": { $regex: employeeName, $options: "i" },
    });
  }
  if (nameFilters.length > 0) {
    aggregatePipeline.push({ $match: { $and: nameFilters } });
  }

  // Sort by date
  aggregatePipeline.push({ $sort: { date: -1 } });

  // Count total documents
  const countPipeline = [...aggregatePipeline, { $count: "total" }];
  const countResult = await DailyOperation.aggregate(countPipeline);
  const totalDailyOperations = countResult[0]?.total || 0;

  // Apply pagination
  aggregatePipeline.push({ $skip: skip }, { $limit: limit });

  const dailyOperations = await DailyOperation.aggregate(aggregatePipeline);

  const totalPages = Math.ceil(totalDailyOperations / limit);

  res.status(200).json({
    status: "success",
    results: dailyOperations.length,
    pagination: {
      total: totalDailyOperations,
      page,
      limit,
      totalPages,
      next: page < totalPages ? page + 1 : null,
      previous: page > 1 ? page - 1 : null,
    },
    data: { dailyOperations },
  });
});

  

const getDailyOperation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid daily operation ID format", 400));
    }
    const dailyOperation = await DailyOperation.findById(id).populate('organization','ownerName').populate('employee','name');
    if (!dailyOperation) {
        return next(new AppError("No daily operation found with that ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            dailyOperation
        }
    });
})

const getAllOrgizationDailyOperations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid organization ID format", 400));
    }

    const { startDate, endDate, employeeName } = req.query;

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);

    // Build base filter
    const filter: any = { organization: id };
    if (startDate || endDate) filter.date = dateFilter;

    // Lookup employee if name filter is applied
    let dailyOperationsQuery = DailyOperation.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ date: -1 })
        .populate("employee", "name");

    // Apply employee name filter
    if (employeeName) {
        dailyOperationsQuery = dailyOperationsQuery.where("employee.name", new RegExp(employeeName as string, "i"));
    }

    const dailyOperations = await dailyOperationsQuery;
    const totalDailyOperations = await DailyOperation.countDocuments(filter);

    const totalPages = Math.ceil(totalDailyOperations / limit);

    res.status(200).json({
        status: "success",
        results: dailyOperations.length,
        pagination: {
            total: totalDailyOperations,
            page,
            limit,
            totalPages,
            next: page < totalPages ? page + 1 : null,
            previous: page > 1 ? page - 1 : null,
        },
        data: {
            dailyOperations,
        },
    });
});

const getOrgDailyOperationsCount = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid organization ID format", 400));
    }

    const count = await DailyOperation.countDocuments({ organization: id });

    res.status(200).json({
        status: "success",
        data: { count },
    });
});

const getOrgDailyOperationsTotals = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid organization ID format", 400));
    }

    const totals = await DailyOperation.aggregate([
        { $match: { organization: new mongoose.Types.ObjectId(id) } },
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
        {
            $project: {
                _id: 0,
                totalRevenue: 1,
                totalExpenses: 1,
                netAmount: { $subtract: ["$totalRevenue", "$totalExpenses"] },
            },
        },
    ]);

    const result = totals[0] || {
        totalRevenue: 0,
        totalExpenses: 0,
        netAmount: 0,
    };

    res.status(200).json({
        status: "success",
        data: { totals: result },
    });
});


export default {
    createDailyOperation,
    deleteDailyOperation,
    updateDailyOperation,
    getAllDailyOperations,
    getDailyOperation,
    getAllOrgizationDailyOperations,
    getOrgDailyOperationsCount,
    getOrgDailyOperationsTotals,
}