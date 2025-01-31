import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlist extends Document {
  user_id: mongoose.Types.ObjectId;
  vehicles: mongoose.Types.ObjectId[]; // Array of vehicle IDs
}

const wishlistSchema: Schema<IWishlist> = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  vehicles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VendorVehicle',
      required: true,
    },
  ],
}, { timestamps: true });

export default mongoose.model<IWishlist>('Wishlist', wishlistSchema);
