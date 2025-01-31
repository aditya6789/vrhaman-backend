import mongoose, { Schema, Document } from "mongoose";
// make model

const makeSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Make = mongoose.model("Make", makeSchema);
export default Make;
