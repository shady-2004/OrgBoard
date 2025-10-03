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

// Login schema (just email + password)
export const loginSchema = authSchema;
