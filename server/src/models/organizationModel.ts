import { Schema, model, Types, Document } from "mongoose";
import Employee from "./employeeModel";
import DailyOperation from "./dailyOperationModel";
import DailyOrganizationOperation from "./organizationDailyOperationModel";
import Saudaization from "./saudizationModel";

// Custom validation functions
const validateNationalId = (id: string): boolean => {
  // Saudi National ID validation (10 digits)
  const nationalIdRegex = /^[12]\d{9}$/;
  return nationalIdRegex.test(id);
};

const validateAbsherCode = (code: string): boolean => {
  // Absher code validation (alphanumeric, 6-20 characters)
  const absherCodeRegex = /^[A-Za-z0-9]{6,20}$/;
  return absherCodeRegex.test(code);
};

const validateAge = (birthDate: Date): boolean => {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18; // Must be at least 18 years old
  }
  return age >= 18;
};

// Organization interface
export interface IOrganization extends Document {
  ownerName: string;          // اسم صاحب المؤسسة
  nationalId: string;         // رقم الهوية
  absherCode: string;         // رمز ابشر
  birthDate: Date;            // تاريخ الميلاد
  qawiSubscriptionDate: Date; // تاريخ اشتراك قوي
  absherSubscriptionDate: Date; // تاريخ اشتراك ابشر
  commercialRecordDate: Date;   // تاريخ السجل التجاري
  commercialRecordNumber: string; // رقم السجل
  sponsorAmount: number;      // المبلغ المطلوب للكفيل
  employees: Types.ObjectId[]; // References to Employee documents
}

const organizationSchema = new Schema<IOrganization>(
  {
    ownerName: { 
      type: String, 
      required: [true, 'Owner name is required'],
      trim: true,
      minlength: [2, 'Owner name must be at least 2 characters'],
      maxlength: [100, 'Owner name cannot exceed 100 characters'],
      match: [/^[\u0600-\u06FFa-zA-Z\s]+$/, 'Owner name can only contain Arabic and English letters']
    },
    nationalId: { 
      type: String, 
      required: [true, 'National ID is required'], 
      unique: true,
      trim: true,
      validate: {
        validator: validateNationalId,
        message: 'National ID must be 10 digits starting with 1 or 2'
      }
    },
    absherCode: { 
      type: String, 
      required: [true, 'Absher code is required'], 
      unique: true,
      trim: true,
      uppercase: true,
      validate: {
        validator: validateAbsherCode,
        message: 'Absher code must be 6-20 alphanumeric characters'
      }
    },
    birthDate: { 
      type: Date, 
      required: [true, 'Birth date is required'],
      validate: {
        validator: validateAge,
        message: 'Owner must be at least 18 years old'
      },
      max: [new Date(), 'Birth date cannot be in the future']
    },
    qawiSubscriptionDate: { 
      type: Date,
      validate: {
        validator: function(date: Date) {
          return !date || date <= new Date();
        },
        message: 'Qawi subscription date cannot be in the future'
      }
    },
    absherSubscriptionDate: { 
      type: Date,
      validate: {
        validator: function(date: Date) {
          return !date || date <= new Date();
        },
        message: 'Absher subscription date cannot be in the future'
      }
    },
    commercialRecordDate: { 
      type: Date,
      validate: {
        validator: function(date: Date) {
          return !date || date <= new Date();
        },
        message: 'Commercial record date cannot be in the future'
      }
    },
    commercialRecordNumber: { 
      type: String, 
      required: [true, 'Commercial record number is required'], 
      unique: true,
      trim: true,
    
    },
    sponsorAmount: { 
      type: Number, 
      required: [true, 'Sponsor amount is required'],
      min: [0, 'Sponsor amount cannot be negative'],
      max: [10000000, 'Sponsor amount cannot exceed 10,000,000 SAR'],
      validate: {
        validator: function(amount: number) {
          return Number.isInteger(amount);
        },
        message: 'Sponsor amount must be a whole number'
      }
    },
  
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Pre-save middleware for additional validations
organizationSchema.pre('save', function(next) {
  // Ensure commercial record date is not before birth date
  if (this.commercialRecordDate && this.birthDate) {
    if (this.commercialRecordDate < this.birthDate) {
      return next(new Error('Commercial record date cannot be before birth date'));
    }
  }

  if(this.qawiSubscriptionDate &&this.birthDate){
    if(this.qawiSubscriptionDate < this.birthDate){
      return next(new Error('Qawi subscription date cannot be before birth date'));
    }
  }
  if(this.absherSubscriptionDate &&this.birthDate){
    if(this.absherSubscriptionDate < this.birthDate){
      return next(new Error('Absher subscription date cannot be before birth date'));
    }
  }


  next();
});



organizationSchema.pre("findOneAndDelete", async function (next) {
  try {
    const orgId = this.getQuery()["_id"];

    // Delete related employees
    await Employee.deleteMany({ organization: orgId });

    // Delete related daily operations
    await DailyOperation.deleteMany({ organization: orgId });

    await DailyOrganizationOperation.deleteMany({ organization: orgId });

    await Saudaization.deleteMany({ organization: orgId });

    next();
  } catch (err) {
    next(err as Error);
  }
});


const Organization = model<IOrganization>("Organization", organizationSchema);

export default Organization;
