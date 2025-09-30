import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { OrganizationInputType, organizationSchemaZod } from "../validations/organization.validation";
import AppError from "../utils/AppError";
import Organization from "../models/organizationModel";
import Employee from "../models/employeeModel";

const createOrganization = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const result = organizationSchemaZod.safeParse(body);
    if (!result.success) {
        return next(new AppError(result.error.message, 400));
    }
    const organizationData:OrganizationInputType = result.data;
    const organization = Organization.create(organizationData);
    res.status(201).json({
        status: "success",
        data: {
            organization
        }
    });
})

const getAllOrganizations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const organizations = await Organization.find({},'-__v');
    res.status(200).json({
        status: "success",
        results: organizations.length,
        data: {
            organizations
        }
    });
})

const deleteOrganization = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid organization ID format", 400));
    }
    const organization = await Organization.findByIdAndDelete(id);
    if (!organization) {
        return next(new AppError("No organization found with that ID", 404));
    }
    res.status(204).json({
        status: "success",
        data: null
    });
})
const updateOrganization = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid organization ID format", 400));
    }
    const body = req.body;
    const result = organizationSchemaZod.safeParse(body);
    if (!result.success) {
        return next(new AppError(result.error.message, 400));
    }
    const organizationData:OrganizationInputType = result.data;
    const organization = await Organization.findByIdAndUpdate(id, organizationData, { new: true, runValidators: true });
    if (!organization) {
        return next(new AppError("No organization found with that ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            organization
        }
    });
})

const getOrganizationById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid organization ID format", 400));
    }
    const organization = await Organization.findById(id,'-__v');

    const employees = await Employee.find({ organization: id }, '-__v -organization');

    const totalRequested = employees.reduce((sum, emp) => sum + (emp.requestedAmount || 0), 0);
    const totalRevenue = employees.reduce((sum, emp) => sum + (emp.revenue || 0), 0);
    const totalExpenses = employees.reduce((sum, emp) => sum + (emp.expenses || 0), 0);
    const remainingFromRevenue = totalRevenue - totalExpenses;
    const totalRemaining = totalRequested - totalRevenue;

    if (!organization) {
        return next(new AppError("No organization found with that ID", 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            organization,
            employees,
            financialSummary: {
                totalRequested,
                totalRevenue,
                totalExpenses,
                remainingFromRevenue,
                totalRemaining
            }
        }
    });
})

export default {
    createOrganization,
    getAllOrganizations , 
    deleteOrganization,
    updateOrganization,
    getOrganizationById
};