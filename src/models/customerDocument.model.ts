import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface ICustomerDocument extends Document {
  user_id: ObjectId;
  document: string;

}

const CustomerDocumentSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User" },
  document: { type: String, required: true , unique: true},
 
});

export default mongoose.model<ICustomerDocument>("CustomerDocument", CustomerDocumentSchema);
