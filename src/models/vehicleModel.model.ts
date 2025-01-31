// // vehicleModel 

// import mongoose, { Schema, Document } from "mongoose";


// // type two wheeler, four wheeler
// // variants available, electric, petrol, diesel, cng, lpg, electric, hybrid
// // body type suv 

// const vehicleModelSchema  = new Schema({
//   make: { type: Schema.Types.ObjectId, ref: "Make", required: true },
//   model:{type:String, required:true},
//   type:{type:String, required:true},
//   variants:{type:Array, required:true},
//   body_type:{type:String, required:false},
//   created_at: { type: Date, default: Date.now },
//   updated_at: { type: Date, default: Date.now },
// });

// const VehicleModel = mongoose.model("VehicleModel", vehicleModelSchema);

// export default VehicleModel;
