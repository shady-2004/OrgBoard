import { Schema, model, Document, Types } from "mongoose";
import Organization from "./organizationModel";
import DailyOperation from "./dailyOperationModel";

export interface IEmployee extends Document {
    _id: Types.ObjectId;            
  type: 'employee' | 'vacancy';     // نوع السجل: موظف أو شاغر وظيفي
  name: string;                     // اسم العامل أو اسم الشاغر الوظيفي
  isSold?: boolean;                 // تم البيع (للشواغر الوظيفية)
  hasArrived?: boolean;             // تم الوصول (للشواغر الوظيفية)
  nationality?: string;             // الجنسية (مطلوب للموظفين فقط)
  phoneNumber?: string;             // رقم الهاتف (مطلوب للموظفين فقط)
  addedBy?: string;                 // بواسطة (مضاف من قبل)
  residencePermitNumber?: string;   // رقم الإقامة (مطلوب للموظفين فقط)
  residencePermitExpiry?: Date;     // تاريخ انتهاء الإقامة (مطلوب للموظفين فقط)
  workCardIssueDate?: Date;         // تاريخ اصدار كرت العمل (مطلوب للموظفين فقط)
  roleInOrganization: string;       // علاقة مع المؤسسة
  requestedAmount?: number;         // المبلغ المطلوب (مطلوب للموظفين فقط)
  revenue?: number;                 // ايراد
  expenses?: number;                // مصروف
  organization: Types.ObjectId;     // Reference to Organization
}

const employeeSchema = new Schema<IEmployee>(
  {
    type: {
      type: String,
      enum: ['employee', 'vacancy'],
      default: 'employee',
      required: [true, "Type is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    isSold: {
      type: Boolean,
      default: false,
    },
    hasArrived: {
      type: Boolean,
      default: false,
    },
    nationality: {
      type: String,
      required: function(this: IEmployee) {
        return this.type === 'employee';
      },
      trim: true,
      minlength: [2, "Nationality must be at least 2 characters"],
      maxlength: [50, "Nationality cannot exceed 50 characters"],
    },
    phoneNumber: {
      type: String,
      required: function(this: IEmployee) {
        return this.type === 'employee';
      },
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
      required: function(this: IEmployee) {
        return this.type === 'employee';
      },
      match: [/^[A-Z0-9]{5,20}$/, "Invalid residence permit number format"],
    },
    residencePermitExpiry: {
      type: Date,
      required: function(this: IEmployee) {
        return this.type === 'employee';
      },
    },
    workCardIssueDate: {
      type: Date,
      required: function(this: IEmployee) {
        return this.type === 'employee';
      },
      validate: {
        validator: function(value: Date) {
          if (!value) return true;
          return value <= new Date();
        },
        message: "Work card issue date cannot be in the future",
      },
    },
    requestedAmount: {
      type: Number,
      min: [0, "Requested amount cannot be negative"],
      default: 0,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization reference is required"],
      validate: {
        validator: async function (value: Types.ObjectId) {
          const orgExists = await Organization.exists({ _id: value });
          return !!orgExists;
        },
        message: "Organization with this ID does not exist",
      },
    },
  },
  { timestamps: true }
);

// Add sparse unique index for residencePermitNumber to allow multiple null values
// This ensures only non-null values must be unique (for employees)
employeeSchema.index({ residencePermitNumber: 1 }, { unique: true, sparse: true });

// Add sparse unique index for phoneNumber to allow multiple null values
// This ensures only non-null values must be unique (for employees)
employeeSchema.index({ phoneNumber: 1 }, { unique: true, sparse: true });

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
