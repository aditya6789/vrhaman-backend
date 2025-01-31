import mongoose, { Document, Schema } from "mongoose";

export interface IVendorVehiclePrivacyPolicy extends Document {
  vendor_id: mongoose.Types.ObjectId;
  cancellation_policy: string;
  terms_conditions: string;
  created_at: Date;
  updated_at: Date;
}

const vendorVehiclePrivacyPolicySchema: Schema = new Schema({
  vendor_id: { 
    type: Schema.Types.ObjectId, 
    ref: "Vendor", 
    required: true 
  },
  cancellation_policy: {
    type: String,
    required: true
  },
  terms_conditions: {
    type: String,
    required: true
  },
  
}, { timestamps: true });

vendorVehiclePrivacyPolicySchema.pre<IVendorVehiclePrivacyPolicy>("save", function (next) {
  this.updated_at = new Date();
  next();
});

export default mongoose.model<IVendorVehiclePrivacyPolicy>(
  "VendorVehiclePrivacyPolicy", 
  vendorVehiclePrivacyPolicySchema
);
