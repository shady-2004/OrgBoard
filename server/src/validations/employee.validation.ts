import { z } from "zod";
import { Types } from "mongoose";

// Custom ObjectId validator
const objectId = z
  .string()
  .refine((val) => Types.ObjectId.isValid(val), { message: "Invalid ObjectId" });

export const employeeSchemaZod = z
  .object({
    type: z.enum(['employee', 'vacancy']).default('employee'),

    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .trim(),

    isSold: z.boolean().optional().default(false),

    hasArrived: z.boolean().optional().default(false),

    nationality: z
      .string()
      .min(2, "Nationality must be at least 2 characters")
      .max(50, "Nationality cannot exceed 50 characters")
      .trim()
      .optional(),

    phoneNumber: z
      .string()
      .regex(/^(05|\+9665)[0-9]{8}$/, "Invalid Saudi phone number format")
      .trim()
      .optional(),

    addedBy: z
      .string()
      .max(100, "Added by field cannot exceed 100 characters")
      .trim()
      .optional(),

    residencePermitNumber: z
      .string()
      .regex(/^[A-Z0-9]{5,20}$/, "Invalid residence permit number format")
      .optional(),

    residencePermitExpiry: z
      .string()
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), { message: "Invalid residence permit expiry date" })
      .optional(),

    workCardIssueDate: z
      .string()
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), { message: "Invalid work card issue date" })
      .refine((date) => date <= new Date(), { message: "Work card issue date cannot be in the future" })
      .optional(),

    requestedAmount: z
      .number({ message: "Requested amount must be a number" })
      .min(0, "Requested amount cannot be negative")
      .optional(),

    organization: objectId,
  })
  .refine(
    (data) => {
      if (data.type === 'employee') {
        return !!(
          data.nationality &&
          data.phoneNumber &&
          data.residencePermitNumber &&
          data.residencePermitExpiry &&
          data.workCardIssueDate
        );
      }
      return true;
    },
    {
      message: "Employee type requires nationality, phoneNumber, residencePermitNumber, residencePermitExpiry, and workCardIssueDate",
    }
  )

// TypeScript type inferred from Zod schema
export type EmployeeInputType = z.infer<typeof employeeSchemaZod>;
