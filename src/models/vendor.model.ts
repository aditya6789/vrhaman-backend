import mongoose, { Document, Schema } from "mongoose";

export interface IVendor extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  business_name: string;
  business_address?: string;
  gst_number: string;
  pancard_number: string;
  id_proof: mongoose.Types.ObjectId;
  alternate_phone?: string;
  vehicle: mongoose.Types.ObjectId;

  pickup_location: {
    // type: "Point";
    latitude: number;
    longitude: number;
    address: string;
  };
  earnings: number;
  created_at: Date;
  updated_at: Date;
  state: string;
  city: string;
  pincode: string;
}

const vendorSchema: Schema<IVendor> = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  business_name: { type: String, required: true },
  business_address: { type: String },
  pickup_location:{
    // type: String,
   
    latitude: {
      type: Number,
      required: true,
      default: 0
    },
    longitude: {
      type: Number, 
      required: true,
      default: 0
    },
    address: {
      type: String,
      required: true
    }

  },
  gst_number: { type: String },
  pancard_number: { type: String },
  id_proof: { type: Schema.Types.ObjectId, ref: "IdProof" },
  alternate_phone: { type: String },
  earnings: { type: Number, default: 0 },
  state: { type: String },
  city: { type: String },
  pincode: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Create geospatial index
vendorSchema.index({ location: "2dsphere" });
// Middleware to update `updated_at` on save
vendorSchema.pre<IVendor>("save", function (next) {
  this.updated_at = new Date();
  next();
});

export default mongoose.model<IVendor>("Vendor", vendorSchema);
