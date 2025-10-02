import { z } from "zod";

// Regex validators
const nationalIdRegex = /^[12]\d{9}$/;
const absherCodeRegex = /^[A-Za-z0-9]{6,20}$/;

export const organizationSchemaZod = z
  .object({
    ownerName: z
      .string()
      .min(2, "Owner name must be at least 2 characters")
      .max(100, "Owner name cannot exceed 100 characters")
      .regex(/^[\u0600-\u06FFa-zA-Z\s]+$/, "Owner name can only contain Arabic and English letters"),

    nationalId: z
      .string()
      .regex(nationalIdRegex, "National ID must be 10 digits starting with 1 or 2"),

    absherCode: z
      .string()
      .regex(absherCodeRegex, "Absher code must be 6-20 alphanumeric characters")
      .transform((val) => val.toUpperCase()),

    birthDate: z
      .string()
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), { message: "Invalid birth date" })
      .refine((date) => date <= new Date(), { message: "Birth date cannot be in the future" })
      .refine((date) => {
        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
          age--;
        }
        return age >= 18;
      }, { message: "Owner must be at least 18 years old" }),

    qawiSubscriptionDate: z
      .string()
      .transform((val) => (val ? new Date(val) : undefined))
      .optional()
      .refine((date) => !date || !isNaN(date.getTime()), { message: "Invalid Qawi subscription date" })
      .refine((date) => !date || date <= new Date(), { message: "Qawi subscription date cannot be in the future" }),

    absherSubscriptionDate: z
      .string()
      .transform((val) => (val ? new Date(val) : undefined))
      .optional()
      .refine((date) => !date || !isNaN(date.getTime()), { message: "Invalid Absher subscription date" })
      .refine((date) => !date || date <= new Date(), { message: "Absher subscription date cannot be in the future" }),

    commercialRecordDate: z
      .string()
      .transform((val) => (val ? new Date(val) : undefined))
      .optional()
      .refine((date) => !date || !isNaN(date.getTime()), { message: "Invalid commercial record date" })
      .refine((date) => !date || date <= new Date(), { message: "Commercial record date cannot be in the future" }),

    commercialRecordNumber: z.string().min(1, "Commercial record number is required"),

    sponsorAmount: z
      .number()
      .min(0, "Sponsor amount cannot be negative")
      .max(10000000, "Sponsor amount cannot exceed 10,000,000 SAR")
      .int("Sponsor amount must be a whole number"),

  })
  .superRefine((data, ctx) => {
    // Validate date fields against birthDate
    const { birthDate, qawiSubscriptionDate, absherSubscriptionDate, commercialRecordDate } = data;

    if (qawiSubscriptionDate && birthDate && qawiSubscriptionDate < birthDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["qawiSubscriptionDate"],
        message: "Qawi subscription date cannot be before birth date",
      });
    }

    if (absherSubscriptionDate && birthDate && absherSubscriptionDate < birthDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["absherSubscriptionDate"],
        message: "Absher subscription date cannot be before birth date",
      });
    }

    if (commercialRecordDate && birthDate && commercialRecordDate < birthDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["commercialRecordDate"],
        message: "Commercial record date cannot be before birth date",
      });
    }
  });

// TypeScript type inferred from Zod schema
export type OrganizationInputType = z.infer<typeof organizationSchemaZod>;
