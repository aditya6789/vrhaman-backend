// src/controllers/vehicleController.ts

import { Request, Response } from "express";
import Vehicle, { IVehicle } from "../models/vehicle.model";
import Vendor from "../models/vendor.model";
import { AuthenticatedRequest } from "../types/auth";
import Joi from "joi";
import { successResponse, failureResponse } from '../utils/response';
import VendorVehicle from "../models/vendor_vehicle.model";

const createVehicle = async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.user_type !== "admin") {
    return res.status(403).json(failureResponse("Only Admin can add vehicles."));
  }

  const schema = Joi.object<IVehicle>({
    name: Joi.string().required(),
    type: Joi.string().valid("Bike", "Car").required(),
    make: Joi.string().required(),
    year: Joi.number(),
    variant: Joi.string().required(),
    engine_cc: Joi.number().allow(null),
    fuel_type: Joi.string().allow(null),
    body_type: Joi.string().allow(null),
    mileage: Joi.number(),
    features: Joi.array().items(Joi.string()),
    weight: Joi.number().required(),
    top_speed: Joi.number(),
    horsepower: Joi.number(),
    torque: Joi.number(),
    seats: Joi.number(),
    motor_power: Joi.number().allow(null),
    charge_time: Joi.number().allow(null),
    range: Joi.number().allow(null)
  });

  const { error, value } = schema.validate(req.body);
  console.log(error)
  if (error) {
    return res.status(400).json(failureResponse(error.details[0].message));
  }

  try {
    // check for vehicle model
    const vehicleModel = await Vehicle.findOne({ name: value.name });
    if (vehicleModel) {
      return res.status(404).json(failureResponse("Vehicle already exists."));
    }

    // Create Vehicle
    const vehicle = new Vehicle(value);
    await vehicle.save();

    return res.status(201).json(successResponse("Vehicle created successfully.", { vehicle }));
  } catch (err) {
    console.error("Create Vehicle Error:", err);
    return res.status(500).json(failureResponse("Internal server error."));
  }
};

const updateVehicle = async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.user_type !== "vendor") {
    return res.status(403).json(failureResponse("Only vendors can update vehicles."));
  }

  const { id } = req.params;

  const schema = Joi.object({
    name: Joi.string().optional(),
    type: Joi.string().valid("Motorcycle", "Car").optional(),
    make: Joi.string().optional(),
    year: Joi.number().integer().optional(),
    variant: Joi.string().optional(),
    engine_cc: Joi.number().optional(),
    fuel_type: Joi.string().valid("petrol", "cng", "diesel").optional(),
    body_type: Joi.string().optional(),
    mileage: Joi.number().optional(),
    features: Joi.array().items(Joi.string()).optional(),
    images: Joi.array().items(Joi.string()).optional(),
    weight: Joi.number().optional(),
    top_speed: Joi.number().optional(),
    horsepower: Joi.number().optional(),
    torque: Joi.number().optional(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json(failureResponse(error.details[0].message));

  try {
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) return res.status(404).json(failureResponse("Vehicle not found."));

    // Update vehicle fields
    Object.assign(vehicle, value);
    await vehicle.save();

    return res.status(200).json(successResponse("Vehicle updated successfully.", { vehicle }));
  } catch (err) {
    console.error("Update Vehicle Error:", err);
    return res.status(500).json(failureResponse("Internal server error."));
  }
};

const getVehicleDetails = async (req: AuthenticatedRequest, res: Response) => {
  console.log("Running getVehicleDetails");
  const { id } = req.params;
  try {
    const vehicle = await Vehicle.findById(id);
    console.log("vehicle", vehicle);
    if (!vehicle) return res.status(404).json(failureResponse("Vehicle not found."));

    res.status(200).json(successResponse("Vehicle details retrieved successfully.", { vehicle }));
  } catch (err) {
    console.error("Get Vehicle Details Error:", err);
    res.status(500).json(failureResponse("Internal server error."));
  }
};

const deleteVehicle = async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.user_type !== "admin") {
    return res.status(403).json(failureResponse("Only admins can delete vehicles."));
  }

  const { id } = req.params;

  try {
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) return res.status(404).json(failureResponse("Vehicle not found."));

    // Check if any vendor vehicles exist with this vehicle ID
    const existingVendorVehicle = await VendorVehicle.findOne({ vehicle_id: id });
    if (existingVendorVehicle) {
      return res.status(400).json(failureResponse("Cannot delete vehicle - vendor vehicles exist with this vehicle."));
    }

    await vehicle.deleteOne();
    res.status(200).json(successResponse("Vehicle deleted successfully."));
  } catch (err) {
    console.error("Delete Vehicle Error:", err);
    res.status(500).json(failureResponse("Internal server error."));
  }
};

const getAllVehicles = async (req: Request, res: Response) => {
  const vehicles = await Vehicle.find();
  return res.status(200).json(successResponse("Vehicles retrieved successfully.", { vehicles }));
};
const getVehicleByMake = async (req: AuthenticatedRequest, res: Response) => {
  console.log('running getVehicleByMake')
  
  const { make } = req.params; // Destructure to get just the make value
  console.log('make:', make)
  
  if (!make) {
    return res.status(400).json(failureResponse("Make parameter is required"));
  }

  try {
    // Pass just the make ID string, not an object
    const vehicles = await Vehicle.find({ make: make });
    return res.status(200).json(successResponse("Vehicles retrieved successfully.", { vehicles }));
  } catch (error) {
    console.error("Error in getVehicleByMake:", error);
    return res.status(500).json(failureResponse("Internal server error"));
  }
};

const getVendorVehicles = async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.user_type !== "vendor") {
    return res.status(400).json(failureResponse("User is not a vendor"));
  }
  try {
    const vendorVehicles = await Vehicle.find();
    return res.status(200).json(successResponse("Vendor vehicles retrieved successfully", vendorVehicles));
  } catch (error: any) {
    return res.status(500).json(failureResponse("Server error"));
  }
}

export {
  getAllVehicles,
  getVehicleDetails,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVendorVehicles,
  getVehicleByMake
};
