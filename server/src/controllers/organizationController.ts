import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { OrganizationInputType, organizationSchemaZod } from "../validations/organization.validation";
import AppError from "../utils/AppError";
import Organization from "../models/organizationModel";
import Employee, { IEmployee } from "../models/employeeModel";
import DailyOperation from "../models/dailyOperationModel";
import { Types } from "mongoose";
import DailyOrganizationOperation from "../models/organizationDailyOperationModel";

const createOrganization = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const result = organizationSchemaZod.safeParse(body);
    if (!result.success) {
        return next(new AppError(result.error.message, 400));
    }
    const organizationData:OrganizationInputType = result.data;
    const organization = await Organization.create(organizationData);
    res.status(201).json({
        status: "success",
        data: {
            organization
        }
    });
})

const getAllOrganizations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Pagination
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
  const skip = (page - 1) * limit;

  // Filtering
  const nameSearch = req.query.name ? String(req.query.name).trim() : null;
  const filter: any = {};
  if (nameSearch) {
    filter.ownerName = { $regex: `\\b${nameSearch}\\b`, $options: "i" };
  }

  // Count total orgs
  const totalOrganizations = await Organization.countDocuments(filter);

  // Aggregation: fetch orgs + join with DailyOrganizationOperation + sum amounts
  const organizations = await Organization.aggregate([
    { $match: filter },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "dailyorganizationoperations", // collection name in MongoDB
        localField: "_id",
        foreignField: "organization",
        as: "operations",
      },
    },
    {
      $addFields: {
        transferredToSponsorTotal: { $sum: "$operations.amount" },
      },
    },
    {
      $project: {
        __v: 0,
        operations: 0, // hide operations array, keep only the total
        
      },
    },
  ]);

  // Pagination object
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
    const updateOrganizationSchema = organizationSchemaZod.partial();
    const result = updateOrganizationSchema.safeParse(req.body);
    if (!result.success) {
        return next(new AppError(result.error.message, 400));
    }
    const organizationData:Partial<OrganizationInputType> = result.data;
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

  // ✅ Validate ObjectId format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new AppError("Invalid organization ID format", 400));
  }

  // ✅ Get organization data
  const organization = await Organization.findById(id, "-__v");
  if (!organization) {
    return next(new AppError("No organization found with that ID", 404));
  }

  const transferredAgg = await DailyOrganizationOperation.aggregate([
    { $match: { organization: new Types.ObjectId(id) } },
    {
      $group: {
        _id: null,
        totalTransferredToSponsor: { $sum: "$amount" },
      },
    },
  ]);

  const totalTransferredToSponsor =
    transferredAgg[0]?.totalTransferredToSponsor || 0;

  res.status(200).json({
    status: "success",
    data: {
      organization:{
        ...organization.toObject(), transferredToSponsorTotal: totalTransferredToSponsor
      },
    },
  });
});

  

const getNamesAndIds = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const organizations = await Organization.find({}, 'ownerName');
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