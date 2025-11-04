import mongoose, { Model, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  email: string;
  name: string;
  password: string;
  role: "Customer" | "Admin";
  isEmailVerified: boolean;
  refresh_token: string;
  password_reset_token: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Simpler document type
export interface IUserDocument extends IUser, IUserMethods, mongoose.Document {
  _id: Types.ObjectId;
}

export interface IUserModel extends Model<IUser, {}, IUserMethods> {
  findByEmail(email: string): Promise<IUserDocument | null>;
  findActiveUsers(): Promise<IUserDocument[]>;
  findByRole(role: "Customer" | "Admin"): Promise<IUserDocument[]>;
}

const userSchema = new mongoose.Schema<IUser, IUserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ["Customer", "Admin"],
        message: "Invalid role specified",
      },
      default: "Customer",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refresh_token: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    password_reset_token: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
  },
  { 
    timestamps: true,
    minimize: false 
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 8);
  next();
});

userSchema.pre("save", function (next) {
  if (this.isModified("email")) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.statics.findByEmail = async function (
  email: string
): Promise<IUserDocument | null> {
  return this.findOne({ email: email.toLowerCase() }).select("+password");
};

userSchema.statics.findActiveUsers = async function (): Promise<IUserDocument[]> {
  return this.find({ isEmailVerified: true }).sort({ createdAt: -1 });
};

// Add as a static method instead of query helper
userSchema.statics.findByRole = async function (
  role: "Customer" | "Admin"
): Promise<IUserDocument[]> {
  return this.find({ role });
};

const User = (mongoose.models.User || 
  mongoose.model<IUser, IUserModel>("User", userSchema)) as IUserModel;

export default User;