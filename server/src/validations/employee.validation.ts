import { z } from "zod";
import { Types } from "mongoose";

// Custom ObjectId validator
const objectId = z
  .string()
  .refine((val) => Types.ObjectId.isValid(val), { message: "Invalid ObjectId" });

export const employeeSchemaZod = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .trim(),

    residencePermitNumber: z
      .string()
      .regex(/^[A-Z0-9]{5,20}$/, "Invalid residence permit number format"),

    residencePermitExpiry: z
      .string()
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), { message: "Invalid residence permit expiry date" })
      .refine((date) => date > new Date(), { message: "Residence permit expiry must be in the future" }),

    workCardIssueDate: z
      .string()
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), { message: "Invalid work card issue date" })
      .refine((date) => date <= new Date(), { message: "Work card issue date cannot be in the future" }),

    requestedAmount: z
      .number({ message: "Requested amount must be a number" })
      .min(0, "Requested amount cannot be negative"),

    organization: objectId,
  })

// TypeScript type inferred from Zod schema
export type EmployeeInputType = z.infer<typeof employeeSchemaZod>;
