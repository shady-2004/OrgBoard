import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { dailyOrganizationOperationSchemaZod } from "../validations/organizationDailyOperation.validation";
import AppError from "../utils/AppError";
import DailyOrganizationOperation from "../models/organizationDailyOperationModel";

const createOrgDailyOperation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const result = dailyOrganizationOperationSchemaZod.safeParse(body);
    if (!result.success) {
        return next(new AppError(result.error.message, 400));
    }
    const orgDailyOperationData = result.data;
    const operation = (await DailyOrganizationOperation.create(orgDailyOperationData)).populate('organization','+name');
    res.status(201).json({
        status: "success",
        data: {
            operation
        }
    });
});

const deleteOrgDailyOperation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid organization daily operation ID format", 400));
    }
    const operation = await DailyOrganizationOperation.findByIdAndDelete(id);
    if (!operation) {
        return next(new AppError("No organization daily operation found with that ID", 404));
    }
    res.status(204).json({
        status: "success",
        data: null
    });
});

const updateOrgDailyOperation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid organization daily operation ID format", 400));
    }
    const result = dailyOrganizationOperationSchemaZod.safeParse(body);
    if (!result.success) {
        return next(new AppError(result.error.message, 400));
    }
    const orgDailyOperationData = result.data;
    const operation = await DailyOrganizationOperation.findByIdAndUpdate(id, orgDailyOperationData, { new: true ,runValidators: true}).populate('organization','+ownerName');
    if (!operation) {
        return next(new AppError("No organization daily operation found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            operation
        }
    });
})

const getAllOrgDailyOperations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const { startDate, endDate, organizationName } = req.query;

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
    ];

    // Optional organization owner name filter
    if (organizationName) {
        aggregatePipeline.push({
            $match: {
                "organization.ownerName": { $regex: organizationName, $options: "i" },
            },
        });
    }

    // Sort by date
    aggregatePipeline.push({ $sort: { date: -1 } });

    // Count total documents
    const countPipeline = [...aggregatePipeline, { $count: "total" }];
    const countResult = await DailyOrganizationOperation.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Apply pagination
    aggregatePipeline.push({ $skip: skip }, { $limit: limit });

    const orgDailyOperations = await DailyOrganizationOperation.aggregate(aggregatePipeline);

    const totalPages = Math.ceil(total / limit);

    const pagination = {
        total,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };

    res.status(200).json({
        status: "success",
        results: orgDailyOperations.length,
        pagination,
        data: { orgDailyOperations },
    });
});


const getOrgDailyOperations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params; // org ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError("Invalid organization ID format", 400));
    }
  
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;
  
    const { startDate, endDate } = req.query;
  
    // Build query
    const filter: any = { organization: id };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }
  
    const total = await DailyOrganizationOperation.countDocuments(filter);
    const dailyOperations = await DailyOrganizationOperation.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 })
      .populate('organization', '+ownerName');
  
    const totalPages = Math.ceil(total / limit);
  
    res.status(200).json({
      status: "success",
      results: dailyOperations.length,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        next: page < totalPages ? page + 1 : null,
        previous: page > 1 ? page - 1 : null,
      },
      data: { dailyOperations },
    });
  });
  

export default {
    createOrgDailyOperation,
    deleteOrgDailyOperation,
    updateOrgDailyOperation,
    getAllOrgDailyOperations,
    getOrgDailyOperations
};