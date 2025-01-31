import mongoose, { Document, Schema } from "mongoose";

export interface IOTP extends Document {
  otp: string;
  phone: string;
  expires_at: Date;
  created_at: Date;
  attempts: number;
}

const otpSchema: Schema<IOTP> = new mongoose.Schema({
  otp: { type: String, required: true },
  phone: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expires_at: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
});

// Index to automatically remove expired OTPs
otpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOTP>("OTP", otpSchema);
