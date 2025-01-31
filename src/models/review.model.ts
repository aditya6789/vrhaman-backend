import mongoose, { Schema, Document } from 'mongoose';

interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  vehicle: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  created_at: Date;
}

const reviewSchema: Schema<IReview> = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<IReview>('Review', reviewSchema);
