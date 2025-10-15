import { Schema, model, Document } from "mongoose";

export interface IOfficeOperation extends Document {
  date: Date;                         // التاريخ
  amount: number;                     // المبلغ
  type: 'expense' | 'revenue';        // نوع العملية
  paymentMethod: 'cash' | 'transfer' | 'mada' | 'visa' | 'other'; // طريقة الدفع
  notes?: string;                     // ملاحظات
}

const officeOperationSchema = new Schema<IOfficeOperation>(
  {
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
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: {
        values: ['expense', 'revenue'],
        message: 'Type must be either "expense" or "revenue"'
      }
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: ['cash', 'transfer', 'mada', 'visa', 'other'],
        message: 'Payment method must be one of: cash, transfer, mada, visa, other'
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

const OfficeOperation = model<IOfficeOperation>('OfficeOperation', officeOperationSchema);

export default OfficeOperation;
