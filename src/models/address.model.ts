import mongoose, { Schema, Document } from "mongoose";

export interface IAddress extends Document {
  user_id: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;

}

const AddressSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User" },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },

});

export default mongoose.model<IAddress>("Address", AddressSchema);
