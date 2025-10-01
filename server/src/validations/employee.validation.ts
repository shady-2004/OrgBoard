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

    roleInOrganization: z
      .string()
      .max(50, "Role cannot exceed 50 characters")
      .trim(),

    requestedAmount: z
      .number({ message: "Requested amount must be a number" })
      .min(0, "Requested amount cannot be negative"),

    revenue: z
      .number({ message: "Revenue must be a number" })
      .optional(),

    expenses: z
      .number({ message: "Expenses must be a number" })
      .optional(),

    organization: objectId,
  })
  .superRefine((data, ctx) => {
    // Example cross-field validation (optional)
    if (data.revenue !== undefined && data.expenses !== undefined) {
      const netRevenue = data.revenue - data.expenses;
      if (data.requestedAmount > netRevenue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["requestedAmount"],
          message: "Requested amount cannot exceed net revenue (revenue - expenses)",
        });
      }
    }
  });

// TypeScript type inferred from Zod schema
export type EmployeeInputType = z.infer<typeof employeeSchemaZod>;
