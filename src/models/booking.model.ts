import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  customer_id: mongoose.Types.ObjectId;
  vehicle_id: mongoose.Types.ObjectId;
  vendor_id: mongoose.Types.ObjectId;
  address_id: string;
  start_date: Date;
  start_time: string;
  duration: String;
  end_date: Date;

  status: "Pending" | "Accepted" | "Rejected" | "Confirmed" | "Ongoing" | "Completed" | "Cancelled";
  total_price: number;
  partial_payment: number;
  payment_type: "partial" | "full";
 
  delivery: boolean;
  created_at: Date;
  updated_at: Date;
}

const bookingSchema: Schema<IBooking> = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  vehicle_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VendorVehicle",
    required: true,
  },
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  address_id: {
   type: String,
   required: false,
  },
  start_date: { type: Date, required: true },
  start_time: { type: String, required: true },
  end_date: { type: Date, required: true },
  duration: { type: String, required: true },

  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected","Confirmed","Ongoing", "Completed", "Cancelled"],
    default: "Pending",
    required: true,
  },
  delivery: { type: Boolean, default: false },
  total_price: { type: Number, required: true },
  partial_payment: { type: Number, required: true },
  payment_type: { type: String, enum: ["partial", "full"], required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Middleware to update `updated_at` on save
bookingSchema.pre<IBooking>("save", function (next) {
  this.updated_at = new Date();
  next();
});

export default mongoose.model<IBooking>("Booking", bookingSchema);
