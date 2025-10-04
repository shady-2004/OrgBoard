import { NextFunction , Request ,Response} from "express";
import catchAsync from "../utils/catchAsync";
import { officeOperationSchemaZod } from "../validations/officeOperation.validation";
import AppError from "../utils/AppError";
import OfficeOperation from "../models/officeOperationModel";

const createOfficeOperation =catchAsync( async (req: Request, res: Response,next : NextFunction) => {
    const body = req.body;
    // Validate request body using Zod schema
    const result = officeOperationSchemaZod.safeParse(body);
    if (!result.success) {
        return next(new AppError(result.error.message, 400));
    }
    const officeOperationData = result.data;
    const officeOperation = await OfficeOperation.create(officeOperationData);
    res.status(201).json({
        status: "success",
        data: {
            officeOperation
        }
    });
});

const deleteOfficeOperation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid office operation ID format", 400));
    }
    const officeOperation = await OfficeOperation.findByIdAndDelete(id);
    if (!officeOperation) {
        return next(new AppError("No office operation found with that ID", 404));
    }
    res.status(204).json({
        status: "success",
        data: null
    });
}); 

const updateOfficeOperation =catchAsync( async (req: Request, res: Response,next : NextFunction) => {
    const body = req.body;
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid office operation ID format", 400));
    }
    const updateOfficeOperationSchemaZod = officeOperationSchemaZod.partial();
    const result = updateOfficeOperationSchemaZod.safeParse(body);
    if (!result.success) {
        return next(new AppError(result.error.message, 400));
    }
    const officeOperationData = result.data;
    const officeOperation = await OfficeOperation.findByIdAndUpdate(id,officeOperationData);
    if (!officeOperation) {
        return next(new AppError("No office operation found with that ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            officeOperation
        }
    });

});

const getAllOfficeOperations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const { startDate, endDate, type, paymentMethod } = req.query;

    // Build filters
    const filter: any = {};

    // Date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);
    if (startDate || endDate) filter.date = dateFilter;

    // Type filter
    if (type) filter.type = type;

    // Payment method filter
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const officeOperations = await OfficeOperation.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ date: -1 });

    const total = await OfficeOperation.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const pagination = {
        total,
        page,
        limit,
        totalPages,
        next: page < totalPages ? page + 1 : null,
        previous: page > 1 ? page - 1 : null,
    };

    res.status(200).json({
        status: "success",
        results: officeOperations.length,
        pagination,
        data: { officeOperations },
    });
});


const getOfficeOperation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid office operation ID format", 400));
    }
    const officeOperation = await OfficeOperation.findById(id);
    if (!officeOperation) {
        return next(new AppError("No office operation found with that ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            officeOperation
        }
    });
});

export default {
    createOfficeOperation,
    deleteOfficeOperation,
    updateOfficeOperation,
    getAllOfficeOperations,getOfficeOperation
};