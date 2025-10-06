                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            import User from "../models/usersModel";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import { Request, Response, NextFunction } from "express";
import { addUserSchema } from "../validations/user.validation";

export const addUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
   
    // Validate email
    const emailResult = addUserSchema.safeParse({ email: req.body.email });

    if (!emailResult.success) {
      return next(new AppError("Invalid input data", 400));
    }

    const { email } = emailResult.data;
    const role = req.body.role || 'user'; // Allow admin to specify role

    // Validate role
    if (!['user', 'moderator'].includes(role)) {
      return next(new AppError("Invalid role. Only 'user' or 'moderator' allowed.", 400));
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("User with this email already exists", 400));
    }

    // Default password "12345678" (or "1-8")
    const defaultPassword = "12345678";

    const newUser = await User.create({
      email,
      password: defaultPassword,
      role,
    });

    res.status(201).json({
      status: "success",
      message: "User added successfully. Default password: 12345678",
      data: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  }
);

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get all users and moderators (exclude admins)
    const users = await User.find({
      role: { $in: ['user', 'moderator'] }
    });

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  }
);

const removeUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError("Invalid user ID format", 400));
    }
    if (!req.user || req.user.id === id) {
      return next(new AppError("You cannot delete your own account", 400));
    }
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return next(new AppError("No user found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

const resetUserPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError("Invalid user ID format", 400));
    }

    const user = await User.findById(id);

    if (!user) {
      return next(new AppError("No user found with that ID", 404));
    }

    // Reset to default password "12345678"
    const defaultPassword = "12345678";
    user.password = defaultPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password reset to default: 12345678",
    });
  }
);


export default { addUser, getAllUsers, removeUser, resetUserPassword };
