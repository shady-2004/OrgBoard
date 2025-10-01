import { z } from "zod";
import { Types } from "mongoose";

// Custom ObjectId validator
const objectId = z
  .string()
  .refine((val) => Types.ObjectId.isValid(val), { message: "Invalid Organization ObjectId" });

export const dailyOrganizationOperationSchemaZod = z.object({
  organization: objectId,

  date: z
    .string()
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), { message: "Invalid date format" })
    .refine((date) => date <= new Date(), { message: "Date cannot be in the future" })
    .optional()
    .default(() => new Date()),

  amount: z
    .number({ message: "Amount must be a number" })
    .min(0, "Amount cannot be negative"),

  notes: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .transform((val) => (val?.trim() === "" ? undefined : val)),
});

// Inferred TypeScript type
export type DailyOrganizationOperationInputType = z.infer<typeof dailyOrganizationOperationSchemaZod>;
