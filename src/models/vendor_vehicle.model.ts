import mongoose, { Schema, Document } from "mongoose";

interface IVendorVehicle extends Document {
  vendor_id: mongoose.Types.ObjectId;
  vehicle_id: mongoose.Types.ObjectId;
  daily_rate: number;
  two_day_rate: number;
  three_day_rate: number;
  vehicle_number: string;
  four_day_rate: number;
  five_day_rate: number;
  six_day_rate: number;
  weekly_rate: number;
  // one_week_rate: number;
  two_week_rate: number;
  three_week_rate: number;
  monthly_rate: number;
  one_month_rate: number;
  // two_month_rate: number;
  three_month_rate: number;
  delivery_fee: number;
  available_delivery: string;
  images: string[];
  color: string;
  bookings: mongoose.Types.ObjectId[];
  availability_status: string;
}

const vendorVehicleSchema = new Schema({
  vendor_id: { type: Schema.Types.ObjectId, ref: "Vendor" },
  vehicle_id: { type: Schema.Types.ObjectId, ref: "Vehicle" },
  daily_rate: { type: Number, required: true },
  two_day_rate: { type: Number, required: true },
  three_day_rate: { type: Number, required: true },
  four_day_rate: { type: Number, required: true },
  vehicle_number: { type: String, required: true },
  five_day_rate: { type: Number, required: true },
  six_day_rate: { type: Number, required: true },
  weekly_rate: { type: Number, required: true },

  two_week_rate: { type: Number, required: true },
  three_week_rate: { type: Number, required: true },
  monthly_rate: { type: Number, required: true },
 
  two_month_rate: { type: Number, required: true },
  three_month_rate: { type: Number, required: true },
  delivery_fee: { type: Number, required: true },
  available_delivery: { type: String, required: true },
  images: { type: [String], required: true },
  color: { type: String, required: true },
  bookings: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
  availability_status: { type: String, enum: ["Available", "Unavailable"], default: "Available" },
});

const VendorVehicle = mongoose.model<IVendorVehicle>("VendorVehicle", vendorVehicleSchema);

export default VendorVehicle;
