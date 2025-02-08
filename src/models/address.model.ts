import mongoose, { Schema, Document } from "mongoose";

export interface IAddress extends Document {
  user_id: mongoose.Types.ObjectId;
  addresses: Array<{
    address: string;
    city: string;
    state: string;
    postalCode: string;
    isDefault: boolean;  // To mark a default address
  }>;
}

const AddressSchema: Schema = new Schema({
  user_id: { 
    type: Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  addresses: [{
 
    address: { 
      type: String, 
      required: true 
    },
    city: { 
      type: String, 
      required: true 
    },
    state: { 
      type: String, 
      required: true 
    },
    postalCode: { 
      type: String, 
      required: true 
    },
    isDefault: {
      type: Boolean,
      default: false
    },
  }]
}, {
  timestamps: true
});


export default mongoose.model<IAddress>("Address", AddressSchema);
