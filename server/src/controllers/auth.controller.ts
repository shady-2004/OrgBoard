import User, { IUser } from "../models/usersModel";
import catchAsync from "../utils/catchAsync";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError";
import { Response, Request, NextFunction } from "express";
import { UserPayload } from "../middlewares/protect";
import { changePasswordSchema, loginSchema, signupSchema } from "../validations/user.validation";

export const signToken = (id: string): string => {
  const jwtSecret = process.env.JWT_SECRET as string;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN as string;

  if (!jwtSecret || !jwtExpiresIn) {
    throw new AppError("JWT configuration missing", 500);
  }
  //@ts-ignore
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
};

const createSendToken = (
  user: UserPayload,
  statusCode: number,
  res: Response
) => {
  const token = signToken(user.id);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

const login = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    // Validate request body with Zod
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError("Invalid email or password", 400));
    }

    const { email, password } = result.data;

    // Get user with password
    const docUser = await User.findOne({ email }).select("+password");
    if (!docUser) {
      return next(new AppError("Incorrect email or password", 401));
    }

    // Compare password using model method
    const isValid = await docUser.correctPassword(password);
    if (!isValid) {
      return next(new AppError("Incorrect email or password", 401));
    }

    // Build payload
    const user: UserPayload = {
      id: docUser._id.toString(),
      role: docUser.role,
    };

    createSendToken(user, 200, res);
  }
);

const signUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate request body
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError(result.error.message, 400));
    }

    const { email, password } = result.data;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("User already exists", 400));
    }

    // Create new user (password will be hashed in model pre-save hook)
    const docUser = await User.create({
      email,
      password,
      role:'admin',
    });

    // Build payload
    const user: UserPayload = {
      id: docUser._id.toString(),
      role: docUser.role,
    };

    createSendToken(user, 201, res);
  }
);

const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate request body

    const result = changePasswordSchema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError(result.error.message, 400));
    }
    const { currentPassword, newPassword } = result.data;

    console.log(currentPassword,newPassword)

    // Get user from req (set by protect middleware)
    const userId = req.user?.id;

    // Check if user exists
    const currentUser = await User.findById(userId).select("+password");
    if (!currentUser) {
      return next(new AppError("User not found", 404));
    }

    // Check if current password is correct
    const isValid = await currentUser.correctPassword(currentPassword);
    if (!isValid) {
      return next(new AppError("Incorrect current password", 401));
    }

    // Update password
    currentUser.password = newPassword;
    await currentUser.save();

    const userPayload: UserPayload = {
      id: currentUser._id.toString(),
      role: currentUser.role,
    };
    createSendToken(userPayload, 200, res);
  }
);

const me = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Get user from req (set by protect middleware)
  const userId = req.user?.id;

  // Check if user exists
  const currentUser = await User.findById(userId).select("-password");
  if (!currentUser) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user: currentUser,
    },
  });
}
);

export default { login, signUp , changePassword , me };