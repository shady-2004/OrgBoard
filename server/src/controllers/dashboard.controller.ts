import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";
import Organization from "../models/organizationModel";
import DailyOperation from "../models/dailyOperationModel";
import User from "../models/usersModel";
import OfficeOperation from "../models/officeOperationModel";

// Get dashboard statistics
export const getDashboardStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Count total organizations
    const totalOrganizations = await Organization.countDocuments();

    // Count total daily operations (employee operations)
    const dailyOperations = await DailyOperation.countDocuments();

    // Count active users
    const activeUsers = await User.countDocuments({ active: true });

    // Count total office operations
    const officeOperations = await OfficeOperation.countDocuments();

    res.status(200).json({
      status: "success",
      data: {
        totalOrganizations,
        dailyOperations,
        activeUsers,
        officeOperations,
      },
    });
  }
);
