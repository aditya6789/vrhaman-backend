import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  phone?: string;
  user_type: "Customer" | "Vendor" | "Admin";
  profile_picture?: string;
  email?: string;
  gender?: string;
  created_at: Date;
  updated_at: Date;
  password?: string;

  is_active: boolean;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  name: { type: String },
  phone: { type: String ,required:true,unique:true},
  user_type: {
    type: String,
    enum: ["Customer", "Vendor", "Admin"],
    required: true,
  },
  password: { type: String },
  profile_picture: { type: String },
  email: { type: String },
  created_at: { type: Date, default: Date.now },
  gender: { type: String },
  // updated_at: { type: Date, default: Date.now },
  // driver_license_image: { type: String },
  // driver_license_number: { type: String },
  // driver_license_expiry: { type: Date },
  // is_verified: { type: Boolean, default: false },
  is_active: { type: Boolean, default: false },
});

// Middleware to update `updated_at` on save
userSchema.pre<IUser>("save", function (next) {
  this.updated_at = new Date();
  next();
});

export default mongoose.model<IUser>("User", userSchema);
