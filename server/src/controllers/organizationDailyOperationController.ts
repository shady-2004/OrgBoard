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
  
    const orgDailyOperations = await DailyOrganizationOperation.find().skip(skip).limit(limit).sort({ date: -1 }).populate('organization','+ownerName');
    const total = await DailyOrganizationOperation.countDocuments();
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
        data: {
            orgDailyOperations,
        },
    });
});

const getOrgDailyOperation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid organization daily operation ID format", 400));
    }
    const operation = await DailyOrganizationOperation.findById(id).populate('organization','+name');
    if (!operation) {
        return next(new AppError("No organization daily operation found with that ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            operation
        }
    });
});

export default {
    createOrgDailyOperation,
    deleteOrgDailyOperation,
    updateOrgDailyOperation,
    getAllOrgDailyOperations,
    getOrgDailyOperation
};