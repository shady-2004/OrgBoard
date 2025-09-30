import { Schema, model, Document, Types } from "mongoose";

export interface IDailyOrganizationOperation extends Document {
  organization: Types.ObjectId;   // علاقة مع المؤسسة
  date: Date;                     // التاريخ
  amount: number;                 // المبلغ
  notes?: string;                 // ملاحظات إضافية
}

const dailyOrganizationOperationSchema = new Schema<IDailyOrganizationOperation>(
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
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    
  },
  { timestamps: true }
);

const DailyOrganizationOperation = model<IDailyOrganizationOperation>(
  'DailyOrganizationOperation',
  dailyOrganizationOperationSchema
);

export default DailyOrganizationOperation;
