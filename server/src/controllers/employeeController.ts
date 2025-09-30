import { NextFunction, Request, Response } from "express";
import { EmployeeInputType, employeeSchemaZod } from "../validations/employee.validation";
import AppError from "../utils/AppError";
import Employee from "../models/employeeModel";
import catchAsync from "../utils/catchAsync";

const createEmployee = catchAsync (async (req: Request, res: Response,next : NextFunction) => {
    const body = req.body;
    // Validate request body using Zod schema
    const result = employeeSchemaZod.safeParse(body);
    if (!result.success) {
        return next(new AppError(result.error.message, 400));
    }
    const employeeData = result.data;
    
    const employee  = await (await Employee.create(employeeData)).populate('organization','+name');
    res.status(201).json({
        status: "success",
        data: {
            employee
        }
    });
});

const updateEmployee =catchAsync( async (req: Request, res: Response,next : NextFunction) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid employee ID format", 400));
    }
    const body = req.body;
    // Validate request body using Zod schema
    const result = employeeSchemaZod.safeParse(body);
    if (!result.success) {
        return next(new AppError(result.error.message, 400));
    }
    const employeeData:EmployeeInputType = result.data;
    const employee = await Employee.findByIdAndUpdate(id, employeeData, { new: true, runValidators: true }).populate('organization','+name');
    if (!employee) {
        return next(new AppError("No employee found with that ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            employee
        }
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
    res.status(204).json({
        status: "success",
        data: null
    });
});
const getAllEmployees = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
  
    // Total employees
    const totalEmployees = await Employee.countDocuments();
  
    // Fetch employees with pagination
    const employees = await Employee.find({}, '-__v')
      .skip(skip)
      .limit(limit)
      .populate('organization', 'name'); // optional
  
    const totalPages = Math.ceil(totalEmployees / limit);
  
    const pagination = {
      total: totalEmployees,
      page,
      limit,
      totalPages,
      next: page < totalPages ? page + 1 : null,
      previous: page > 1 ? page - 1 : null,
    };
  
    res.status(200).json({
      status: "success",
      results: employees.length,
      pagination,
      data: {
        employees,
      },
    });
  });
  


export default { createEmployee , updateEmployee , deleteEmployee,getAllEmployees};