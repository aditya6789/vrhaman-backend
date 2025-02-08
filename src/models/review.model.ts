import mongoose, { Schema, Document } from 'mongoose';

interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  created_at: Date;
}


const reviewSchema: Schema<IReview> = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorVehicle', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },

  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<IReview>('Review', reviewSchema);
