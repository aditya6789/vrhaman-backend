import mongoose, { Document, Schema } from "mongoose";

export interface IVehicle {
  name: string;
  type: "Bike" | "Car";
  make?: string;
  year?: number;
  created_at: Date;
  updated_at: Date;
  variant: string;
  weight: number;
  engine_cc?: number;
  fuel_type?: "Petrol" | "Diesel" | "Electric" | "Hybrid" |"Cng" |"Electric";
  body_type?: string;
  mileage?: number;
  features?: string[];
  top_speed?: number;
  horsepower?: number;
  torque?: number;
  seats?: number;
  motor_power?: number;
  charge_time?: number;
  range?: number;
}

const vehicleSchema: Schema<IVehicle> = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["Bike", "Car"], required: true },
  make: { type: Schema.Types.ObjectId, ref: "Make", required: true },
  year: { type: Number },
  variant: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  engine_cc: { type: Number },
  fuel_type: { type: String },
  body_type: { type: String },
  mileage: { type: Number },
  features: { type: [String] },
  weight: { type: Number, required: true },
  top_speed: { type: Number },
  horsepower: { type: Number },
  torque: { type: Number },
  seats: { type: Number },
  motor_power: { type: Number, default: null },
  charge_time: { type: Number, default: null },
  range: { type: Number, default: null }
});

// Middleware to update `updated_at` on save
vehicleSchema.pre<IVehicle>("save", function (next) {
  this.updated_at = new Date();
  next();
});

export default mongoose.model<IVehicle>("Vehicle", vehicleSchema);
