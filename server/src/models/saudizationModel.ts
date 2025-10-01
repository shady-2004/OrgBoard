import { Schema, model, Document, Types } from "mongoose";

export interface ISaudaization extends Document {
  organization: Types.ObjectId;            // المؤسسة
  date: Date;                              // التاريخ
  employeeName: string;                    // اسم الموظف
  workPermitStatus: 'pending' | 'issue_problem' | 'issued'; // رخص العمل
  deportationStatus: 'deported' | 'pending';               // الإبعاد
  deportationDate?: Date;                  // تاريخ الإبعاد
  notes?: string;                          // ملاحظات
}

const saudaizationSchema = new Schema<ISaudaization>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required']
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
      validate: {
        validator: (value: Date) => value <= new Date(),
        message: 'Date cannot be in the future'
      }
    },
    employeeName: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
      minlength: [2, 'Employee name must be at least 2 characters'],
      maxlength: [100, 'Employee name cannot exceed 100 characters']
    },
    workPermitStatus: {
      type: String,
      required: [true, 'Work permit status is required'],
      enum: {
        values: ['pending', 'issue_problem', 'issued'],
        message: 'Work permit status must be pending, issue_problem, or issued'
      }
    },
    deportationStatus: {
      type: String,
      required: [true, 'Deportation status is required'],
      enum: {
        values: ['deported', 'pending'],
        message: 'Deportation status must be deported or pending'
      }
    },
    deportationDate: {
      type: Date,
      validate: {
        validator: function(value: Date) {
          return !value || value <= new Date();
        },
        message: 'Deportation date cannot be in the future'
      }
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  { timestamps: true }
);

const Saudaization = model<ISaudaization>('Saudaization', saudaizationSchema);

export default Saudaization;
