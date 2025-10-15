import { z } from "zod";
import { Types } from "mongoose";

export const dailyOperationSchemaZod = z.object({
  organization: z.string()
    .refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid organization ObjectId"
    }),

  employee: z.string()
    .refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid employee ObjectId"
    }),

  date: z.preprocess((val) => {
    if (typeof val === "string" || val instanceof Date) {
      return new Date(val);
    }
    return val;
  }, z.date().max(new Date(), { message: "Date cannot be in the future" })),

  amount: z.number()
    .min(1, { message: "Amount must be greater than zero" }),

  category: z.enum(["expense", "revenue"], {
    error: "Category is required",
  }),

  paymentMethod: z.enum(["cash", "transfer", "mada", "visa", "other"], {
    error: "Payment method is required",
  }),

  invoice: z.string()
    .trim()
    .max(200, { message: "Invoice cannot exceed 200 characters" })
    .optional(),

  notes: z.string()
    .trim()
    .max(500, { message: "Notes cannot exceed 500 characters" })
    .optional(),
});

// Type inference (for TypeScript)
export type DailyOperationInput = z.infer<typeof dailyOperationSchemaZod>;
