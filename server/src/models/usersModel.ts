import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Email must be valid"]
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
      required: true
    }
  },
  { timestamps: true }
);

const User = model<IUser>('User', userSchema);

export default User;
