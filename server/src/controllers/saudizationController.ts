import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import { saudaizationZodSchema } from "../validations/saudization.validation";
import Saudaization from "../models/saudizationModel";
const createSaudizationRecord = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const result = saudaizationZodSchema.safeParse(body);
    if (!result.success) {
        return next(new AppError(result.error.message, 400));
    }
    const saudizationData = result.data;
    const saudization = (await Saudaization.create(saudizationData)).populate('organization', '+ownerName');
    res.status(201).json({
        status: "success",
        data: {
            saudization
        }
    });
});
const deleteSaudizationRecord = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid saudization ID format", 400));
    }
    const saudization = await Saudaization.findByIdAndDelete(id);
    if (!saudization) {
        return next(new AppError("No saudization found with that ID", 404));
    }
    res.status(204).json({
        status: "success",
        data: null
    });
});
const updateSaudizationRecord = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid saudization ID format", 400));
    }
    const result = saudaizationZodSchema.safeParse(body);
    if (!result.success) {
        return next(new AppError(result.error.message, 400));
    }
    const saudizationData = result.data;
    const saudization = await Saudaization.findByIdAndUpdate(id, saudizationData, { new: true, runValidators: true }).populate('organization', '+ownerName');
    if (!saudization) {
        return next(new AppError("No saudization found with that ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            saudization
        }
    });
});
const getSaudizationRecord = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid saudization ID format", 400));
    }
    const saudization = await Saudaization.findById(id).populate('organization', '+ownerName');
    if (!saudization) {
        return next(new AppError("No saudization found with that ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            saudization
        }
    });
});
const getAllSaudizationsRecords = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Pagination
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;
  
    const nameSearch = req.query.name ? String(req.query.name).trim() : null;
    const filter: any = {};
    if (nameSearch) {
      filter.name = { $regex: nameSearch, $options: "i" }; // case-insensitive
    }
  
    const total = await Saudaization.countDocuments(filter);
  
    const saudizations = await Saudaization.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });
  
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
      results: saudizations.length,
      pagination,
      data: {
        saudizations,
      },
    });
  });
  
export default {
    createSaudizationRecord,
    deleteSaudizationRecord,
    updateSaudizationRecord,
    getSaudizationRecord,
    getAllSaudizationsRecords
};