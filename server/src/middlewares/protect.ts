import util from "util";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";
import jwt from "jsonwebtoken";
import User from "../models/usersModel";

export interface UserPayload {
  id: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

const protect = catchAsync(async (req, _res, next) => {
  // 1) Get token from headers
  let token;
  
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2) If no token, block access
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 3) Verify token
  const jwtSecret = process.env.JWT_SECRET as string;
  const verifyToken = util.promisify<string, string, any>(jwt.verify);
  const decoded = (await verifyToken(token, jwtSecret)) as {
    id: string;
    iat: number;
  };

  // 4) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401)
    );
  }

  // 5) Check if user changed password after token was issued
  if (currentUser.passwordChangedAt) {
    const passwordChangedTimestamp = Math.floor(
      currentUser.passwordChangedAt.getTime() / 1000
    );

    if (passwordChangedTimestamp > decoded.iat) {
      return next(
        new AppError("User recently changed password! Please log in again.", 401)
      );
    }
  }

  // 6) Build user payload
  const user: UserPayload = {
    id: currentUser._id.toString(),
    email: currentUser.email,
    role: currentUser.role
  };

  // 7) Attach user to request
  req.user = user;
  next();
});

export default protect;
