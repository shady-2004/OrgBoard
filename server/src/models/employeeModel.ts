import { Schema, model, Document, Types } from "mongoose";
import Organization from "./organizationModel";
import DailyOperation from "./dailyOperationModel";

export interface IEmployee extends Document {
    _id: Types.ObjectId;            
  name: string;                     // اسم العامل
  phoneNumber: string;              // رقم الهاتف
  addedBy?: string;                 // بواسطة (مضاف من قبل)
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
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^(05|\+9665)[0-9]{8}$/, "Invalid Saudi phone number format"],
    },
    addedBy: {
      type: String,
      trim: true,
      maxlength: [100, "Added by field cannot exceed 100 characters"],
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
   
    },
    workCardIssueDate: {
      type: Date,
      required: [true, "Work card issue date is required"],
      validate: {
        validator: (value: Date) => value <= new Date(),
        message: "Work card issue date cannot be in the future",
      },
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
      validate: {
        validator: async function (value: Types.ObjectId) {
          // Check if Organization with this ID exists
          const orgExists = await Organization.exists({ _id: value });
          return !!orgExists; // true if exists, false otherwise
        },
        message: "Organization with this ID does not exist",
      },
    },
    
  },
  { timestamps: true }
);



employeeSchema.pre("findOneAndDelete", async function (next) {
  try {
    const empId = this.getQuery()["_id"];

    // Delete all daily operations linked to this employee
    await DailyOperation.deleteMany({ employee: empId });

    next();
  } catch (err) {
    next(err as Error);
  }
});


const Employee = model<IEmployee>("Employee", employeeSchema);

export default Employee;
