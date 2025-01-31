import mongoose, { Document, Schema } from "mongoose";

export interface IIdProof extends Document {
  vendor_id: mongoose.Types.ObjectId;

  id_image: string;
  created_at: Date;
  updated_at: Date;
}

const idProofSchema: Schema = new Schema({
  vendor_id: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },

  id_image: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

idProofSchema.pre<IIdProof>("save", function (next) {
  this.updated_at = new Date();
  next();
});

export default mongoose.model<IIdProof>("IdProof", idProofSchema);
