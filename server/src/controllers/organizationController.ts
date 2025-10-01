import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { OrganizationInputType, organizationSchemaZod } from "../validations/organization.validation";
import AppError from "../utils/AppError";
import Organization from "../models/organizationModel";
import Employee, { IEmployee } from "../models/employeeModel";
import DailyOperation from "../models/dailyOperationModel";

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
    // Parse query params with defaults
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    // Total number of organizations
    const totalOrganizations = await Organization.countDocuments();

    // Fetch organizations with pagination
    const organizations = await Organization.find({}, '-__v')
        .skip(skip)
        .limit(limit);

    const totalPages = Math.ceil(totalOrganizations / limit);

    const pagination = {
        total: totalOrganizations,
        page,
        limit,
        totalPages,
        next: page < totalPages ? page + 1 : null,
        previous: page > 1 ? page - 1 : null,
    };

    res.status(200).json({
        status: "success",
        results: organizations.length,
        pagination,
        data: {
            organizations,
        },
    });
});

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

    const organization = await Organization.findById(id, '-__v');
    if (!organization) {
        return next(new AppError("No organization found with that ID", 404));
    }

    const employees:IEmployee[] = await Employee.find({ organization: id }, '-__v -organization').lean();

    // Fetch all daily operations for this organization
    const operations = await DailyOperation.find({ organization: id });

    // Map employee revenue and expenses from operations
    const employeeFinancials = employees.map(emp => {
        const empOps = operations.filter(op => op.employee.toString() === emp._id.toString());
        const totalRevenue = empOps
            .filter(op => op.category === 'revenue')
            .reduce((sum, op) => sum + op.amount, 0);
        const totalExpenses = empOps
            .filter(op => op.category === 'expense')
            .reduce((sum, op) => sum + op.amount, 0);

        return {
            ...emp.toObject(),
            revenue: totalRevenue,
            expenses: totalExpenses,
        };
    });

    // Calculate organization-level totals
    const totalRequested = employees.reduce((sum, emp) => sum + (emp.requestedAmount || 0), 0);
    const totalRevenue = employeeFinancials.reduce((sum, emp) => sum + emp.revenue, 0);
    const totalExpenses = employeeFinancials.reduce((sum, emp) => sum + emp.expenses, 0);
    const remainingFromRevenue = totalRevenue - totalExpenses;
    const totalRemaining = totalRequested - totalRevenue;

    res.status(200).json({
        status: "success",
        data: {
            organization,
            employees: employeeFinancials,
            financialSummary: {
                totalRequested,
                totalRevenue,
                totalExpenses,
                remainingFromRevenue,
                totalRemaining
            }
        }
    });
});

const getNamesAndIds = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const organizations = await Organization.find({}, 'name _id');
    res.status(200).json({
        status: "success",
        results: organizations.length,
        data: {
            organizations
        }
    });
});



export default {
    createOrganization,
    getAllOrganizations , 
    deleteOrganization,
    updateOrganization,
    getOrganizationById,
    getNamesAndIds
};