import { z } from "zod";

export const saudaizationZodSchema = z.object({
  organization: z.string().min(1, "Organization is required"),

  date: z
    .preprocess((val) => (val ? new Date(val as string) : new Date()), z.date())
    .refine((date) => date <= new Date(), {
      message: "Date cannot be in the future",
    }),

  employeeName: z
    .string()
    .min(2, "Employee name must be at least 2 characters")
    .max(100, "Employee name cannot exceed 100 characters")
    .regex(/^[\p{L}\s.'-]+$/u, "Employee name contains invalid characters"),

  workPermitStatus: z.enum(["pending", "issue_problem", "issued"]).refine(
    (val) => ["pending", "issue_problem", "issued"].includes(val),
    { message: "Work permit status must be pending, issue_problem, or issued" }
  ),

  deportationStatus: z.enum(["deported", "pending"]).refine(
    (val) => ["deported", "pending"].includes(val),
    { message: "Deportation status must be deported or pending" }
  ),

  deportationDate: z
    .preprocess((val) => (val ? new Date(val as string) : undefined), z.date().optional())
    .refine((date) => !date || date <= new Date(), {
      message: "Deportation date cannot be in the future",
    }),

  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
})
.refine((data) => {
  if (data.deportationStatus === "deported" && !data.deportationDate) {
    return false;
  }
  return true;
}, {
  message: "Deportation date is required when status is deported",
  path: ["deportationDate"],
});

export type SaudizationInput = z.infer<typeof saudaizationZodSchema>;
