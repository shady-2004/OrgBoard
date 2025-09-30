import { Schema, model, Document, Types } from "mongoose";

export interface IEmployee extends Document {
    _id: Types.ObjectId;            // معرف فريد للعامل
  name: string;                     // اسم العامل
  residencePermitNumber: string;    // رقم الإقامة (Iqama number)
  residencePermitExpiry: Date;      // تاريخ انتهاء الإقامة
  workCardIssueDate: Date;          // تاريخ اصدار كرت العمل
  roleInOrganization: string;       // علاقة مع المؤسسة
  requestedAmount: number;          // المبلغ المطلوب
  revenue?: number;                 // ايراد
  expenses?: number;                // مصروف
  organization: Types.ObjectId;     // Reference to Organization
}

const employeeSchema = new Schema<IEmployee>(
  {
    name: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    residencePermitNumber: {
      type: String,
      required: [true, "Residence permit number is required"],
      unique: true,
      match: [/^[A-Z0-9]{5,20}$/, "Invalid residence permit number format"], // Example pattern
    },
    residencePermitExpiry: {
      type: Date,
      required: [true, "Residence permit expiry date is required"],
      validate: {
        validator: (value: Date) => value > new Date(),
        message: "Residence permit expiry must be in the future",
      },
    },
    workCardIssueDate: {
      type: Date,
      required: [true, "Work card issue date is required"],
      validate: {
        validator: (value: Date) => value <= new Date(),
        message: "Work card issue date cannot be in the future",
      },
    },
    roleInOrganization: {
      type: String,
      required: [true, "Role in organization is required"],
      trim: true,
      maxlength: [50, "Role cannot exceed 50 characters"],
    },
    requestedAmount: {
      type: Number,
      required: [true, "Requested amount is required"],
      min: [0, "Requested amount cannot be negative"],
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization reference is required"],
    },
  },
  { timestamps: true }
);

const Employee = model<IEmployee>("Employee", employeeSchema);

export default Employee;
