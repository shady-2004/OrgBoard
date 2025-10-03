import { z } from "zod";

// Common email + password schema
const authSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password cannot exceed 100 characters"),
});

// Signup schema (extends login with role)
export const signupSchema = authSchema.extend({
  role: z.enum(["admin", "user"]).default("user"),
});

export const addUserSchema = z.object({
  email: z.string().email("Invalid email address"),
});


export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(8, "Current password must be at least 8 characters long"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters long"),
});

// Login schema (just email + password)
export const loginSchema = authSchema;
