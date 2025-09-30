import { Schema, model, Document, Types } from "mongoose";

export interface IDailyOperation extends Document {
  organization: Types.ObjectId;       // علاقة مع المؤسسة
  employee: Types.ObjectId;           // علاقة مع العامل
  date: Date;                          // التاريخ
  amount: number;                      // المبلغ
  category: 'expense' | 'revenue';     // التصنيف
  paymentMethod: 'cash' | 'bank' | 'credit' | 'other'; // طريقة الدفع
  invoice?: string;                    // فاتورة (رقم أو رابط)
  notes?: string;                      // ملاحظات
}

const dailyOperationSchema = new Schema<IDailyOperation>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required']
    },
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required']
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
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['expense', 'revenue'],
        message: 'Category must be either "expense" or "revenue"'
      }
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: ['cash', 'bank', 'credit', 'other'],
        message: 'Payment method must be one of: cash, bank, credit, other'
      }
    },
    invoice: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  { timestamps: true }
);

const DailyOperation = model<IDailyOperation>('DailyOperation', dailyOperationSchema);

export default DailyOperation;
