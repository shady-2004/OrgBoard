import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { dailyOperationSchemaZod } from "../validations/dailyOperation.validation";
import AppError from "../utils/AppError";
import DailyOperation from "../models/dailyOperationModel";
const createDailyOperation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    // Validate request body using Zod schema
    const result = dailyOperationSchemaZod.safeParse(body);
    if (!result.success) {
        return next(new AppError(result.error.message, 400));
    }
    const dailyOperationData = result.data;
    const dailyOperation = (await (await DailyOperation.create(dailyOperationData)).populate('organization','+ownerName')).populate('employee','+name'); 
    res.status(201).json({
        status: "success",
        data: {
            dailyOperation
        }
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
    const result = dailyOperationSchemaZod.safeParse(body);
    if (!result.success) {
        return next(new AppError(result.error.message, 400));
    }
    const dailyOperationData = result.data;
    const dailyOperation = await DailyOperation.findByIdAndUpdate(id, dailyOperationData, { new: true ,runValidators: true}).populate('organization','+ownerName').populate('employee','+name');
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
    const dailyOperation = await DailyOperation.findById(id).populate('organization','+name').populate('employee','+name');
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


export default {
    createDailyOperation,
    deleteDailyOperation,
    updateDailyOperation,
    getAllDailyOperations,
    getDailyOperation , 
    getAllOrgizationDailyOperations
}