import { z } from "zod";

export const officeOperationSchemaZod = z.object({
  date: z
    .string()
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), { message: "Invalid date format" })
    .refine((date) => date <= new Date(), { message: "Date cannot be in the future" })
    .optional() // because default = Date.now in mongoose
    .default(() => new Date()),

  amount: z
    .number({ message: "Amount must be a number" })
    .min(0, "Amount cannot be negative"),

  type: z.enum(["expense", "revenue"], {
    error: 'Type must be either "expense" or "revenue"',
  }),

  paymentMethod: z.enum(["cash", "transfer", "mada", "visa", "other"], {
    error: "Payment method must be one of: cash, transfer, mada, visa, other",
  }),

  notes: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .transform((val) => (val?.trim() === "" ? undefined : val)), // normalize empty strings to undefined
});

// Infer TypeScript type
export type OfficeOperationInputType = z.infer<typeof officeOperationSchemaZod>;
