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
    const dailyOperation = (await (await DailyOperation.create(dailyOperationData)).populate('organization','+name')).populate('employee','+name'); 
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
    const dailyOperation = await DailyOperation.findByIdAndUpdate(id, dailyOperationData, { new: true ,runValidators: true}).populate('organization','+name').populate('employee','+name');
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

    const dailyOperations = await DailyOperation.find().skip(skip).limit(limit).sort({ date: -1 }).populate('organization','+name').populate('employee','+name');
    const totalDailyOperations = await DailyOperation.countDocuments();

    const totalPages = Math.ceil(totalDailyOperations / limit);


    const pagination = {
        total: totalDailyOperations,
        page,
        limit,
        totalPages,
        next: page < totalPages ? page + 1 : null,
        previous: page > 1 ? page - 1 : null,
      };

    res.status(200).json({
        status: "success",
        results: dailyOperations.length,
        pagination,
        data: {
            dailyOperations
        }
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

export default {
    createDailyOperation,
    deleteDailyOperation,
    updateDailyOperation,
    getAllDailyOperations,
    getDailyOperation
}