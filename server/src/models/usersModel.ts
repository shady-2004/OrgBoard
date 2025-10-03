import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  role: 'admin' | 'user';
  password: string;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  correctPassword(candidatePassword: string): Promise<boolean>;
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
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 100,
      select: false
    },
    passwordChangedAt: {
      type: Date,
    }
  },
  { timestamps: true }
);

// 🔑 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// 🔑 Add a method to check password
userSchema.methods.correctPassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = model<IUser>("User", userSchema);

export default User;
