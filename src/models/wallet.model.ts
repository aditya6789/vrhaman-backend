import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
  vendor_id: mongoose.Types.ObjectId;
  balance: number;
  transactions: Array<{
    booking_id: mongoose.Types.ObjectId;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    created_at: Date;
  }>;
}

const WalletSchema = new Schema({
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0
  },
  transactions: [{
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model<IWallet>('Wallet', WalletSchema);
