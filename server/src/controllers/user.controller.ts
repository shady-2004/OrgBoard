import User from "../models/usersModel";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import { Request, Response, NextFunction } from "express";
import { addUserSchema } from "../validations/user.validation";

export const addUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
   

    const result = addUserSchema.safeParse(req.body);

    if (!result.success) {
      return next(new AppError("Invalid input data", 400));
    }

    const { email } = result.data;

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
      role: "user",
    });

    res.status(201).json({
      status: "success",
      message: "User added successfully. Please ask user to change password on first login.",
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
    const users = await User.find({
      role: { $eq: 'user' }
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
