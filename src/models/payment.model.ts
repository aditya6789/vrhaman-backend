import mongoose, { Document } from "mongoose";

export interface IPayment extends Document {
  booking_id: mongoose.Schema.Types.ObjectId;
  amount: number;
  payment_id: string;
  payment_status: "Completed" | "Failed" | "Pending" | "Refunded";

}

const PaymentSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    payment_id: {
      type: String,
      required: true,
    },
  
    payment_status: {
      type: String,
      enum: ["Completed", "Failed", "Pending", "Refunded"],
      required: true,
    },
 
  },
  {
    timestamps: true,
  }
);

PaymentSchema.index({ booking_id: 1 });
PaymentSchema.index({ payment_id: 1 });

const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
