import { Request, Response, NextFunction } from "express";
import connect from "../client/client";

/**
 * Middleware to ensure MongoDB connection is established before processing requests
 * Critical for serverless environments like Vercel where connections may not persist
 */
export const ensureDbConnection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Ensure connection is established (will use cached connection if available)
    await connect();
    next();
  } catch (error) {
    console.error("❌ Database connection middleware error:", error);
    res.status(503).json({
      status: "error",
      message: "Database connection failed. Please try again.",
    });
  }
};
