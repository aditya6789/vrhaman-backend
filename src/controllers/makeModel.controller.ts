// make model controller

import { Request, Response } from "express";
import Make from "../models/make.model";
// import VehicleModel from "../models/vehicleModel.model";
import Joi from "joi";
import { AuthenticatedRequest } from "../types/auth";
import { successResponse, failureResponse } from "../utils/response";
import { ObjectId } from "mongoose";
import vehicleModel from "../models/vehicle.model";

// Make CRUD operations

const createMake = async (req: AuthenticatedRequest, res: Response) => {
  console.log("req.body", req.body);
  const { name, image } = req.body;
    console.log(req.user);
  if (req.user?.user_type !== "admin") {
    return res.status(403).json(failureResponse("Only admins can create makes.", null, 403));
  }


  try {
    const make = new Make({ name, image });
    await make.save();
    res.status(201).json(successResponse("Make created successfully.", { make }, 201));
  } catch (err) {
    console.error("Create Make Error:", err);
    res.status(500).json(failureResponse("Internal server error.", null, 500));
  }
};

const getAllMakes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const makes = await Make.find();
    res.status(200).json(successResponse("Makes retrieved successfully.", { makes }));
  } catch (err) {
    console.error("Get All Makes Error:", err);
    res.status(500).json(failureResponse("Internal server error.", null, 500));
  }
};

const updateMake = async (req: AuthenticatedRequest, res: Response) => {
  console.log("req.body", req.body);
  if (req.user?.user_type !== "admin") {
    return res.status(403).json(failureResponse("Only admins can update makes.", null, 403));
  }

  try {
    const make = await Make.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!make) return res.status(404).json(failureResponse("Make not found.", null, 404));
    res.status(200).json(successResponse("Make updated successfully.", { make }));
  } catch (err) {
    console.error("Update Make Error:", err);
    res.status(500).json(failureResponse("Internal server error.", null, 500));
  }
};

const deleteMake = async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.user_type !== "admin") {
    return res.status(403).json(failureResponse("Only admins can delete makes.", null, 403));
  }

  try {
    const make = await Make.findByIdAndDelete(req.params.id);
    if (!make) return res.status(404).json(failureResponse("Make not found.", null, 404));

    // Check if any vehicles exist with this make ID
    const existingVehicles = await vehicleModel.findOne({ make: req.params.id });

    if (existingVehicles) {
      return res.status(400).json(failureResponse("Cannot delete make - vehicles exist with this make.", null, 400));
    }
    res.status(200).json(successResponse("Make deleted successfully.", null));
  } catch (err) {
    console.error("Delete Make Error:", err);
    res.status(500).json(failureResponse("Internal server error.", null, 500));
  }
};

// VehicleModel CRUD operations

// const createVehicleModel = async (req: AuthenticatedRequest, res: Response) => {
//   if (req.user?.user_type !== "Admin") {
//     return res.status(403).json(failureResponse("Only admins can create vehicle models.", null, 403));
//   }

//   const schema = Joi.object({
//     make: Joi.string().required(), // Assuming this will be an ObjectId in the actual implementation
//     model: Joi.string().required(),
//     type: Joi.string().valid('Bike', 'Car').required(),
//     variants: Joi.array().items(Joi.string()).required(),
//     body_type: Joi.string().valid('SUV', 'SEDAN', 'BIKE').optional(),
//   });


//   try {
//     const make = await Make.findById(req.body.make);
//     console.log("Make", make);
//     if (!make) return res.status(400).json(failureResponse("Make not found.", null, 400));
//   } catch (err) {
//     return res.status(400).json(failureResponse("Invalid Make ID.", null, 400));
//   }


//   const { error, value } = schema.validate(req.body);
//   if (error) return res.status(400).json(failureResponse(error.details[0].message));

//     // check if make exists

//   try {
//     const vehicleModel = new VehicleModel(value);
//     await vehicleModel.save();
//     res.status(201).json(successResponse("Vehicle model created successfully.", { vehicleModel }, 201));
//   } catch (err) {
//     console.error("Create Vehicle Model Error:", err);
//     res.status(500).json(failureResponse("Internal server error.", null, 500));
//   }
// };

// const getAllVehicleModels = async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const vehicleModels = await VehicleModel.find().populate("make");
//     res.status(200).json(successResponse("Vehicle models retrieved successfully.", { vehicleModels }));
//   } catch (err) {
//     console.error("Get All Vehicle Models Error:", err);
//     res.status(500).json(failureResponse("Internal server error.", null, 500));
//   }
// };

// const getVehicleModelById = async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const makeId = req.params.id;
    
//     // Find all vehicle models with the given make ID
//     const vehicleModels = await VehicleModel.find({ make: makeId }).populate('make');
    
//     if (!vehicleModels || vehicleModels.length === 0) {
//       return res.status(404).json(failureResponse("No vehicle models found for this make.", null, 404));
//     }

//     res.status(200).json(successResponse("Vehicle models retrieved successfully.", { vehicleModels }));
//   } catch (err) {
//     console.error("Get Vehicle Models By Make ID Error:", err);
//     res.status(500).json(failureResponse("Internal server error.", null, 500));
//   }
// };

// const updateVehicleModel = async (req: AuthenticatedRequest, res: Response) => {
//   if (req.user?.user_type !== "Admin") {
//     return res.status(403).json(failureResponse("Only admins can update vehicle models.", null, 403));
//   }

//   const schema = Joi.object({
//     make: Joi.string().optional(),
//     model: Joi.string().optional(),
//     type: Joi.string().optional().valid('Bike', 'Car'),
//     variants: Joi.array().items(Joi.string()).optional(),
//     body_type: Joi.string().optional().valid('SUV', 'SEDAN', 'BIKE'),
//   });

// //  check if make exists    
//   try {
//     if (req.body.make) {
//       const make = await Make.findById(req.body.make);
//       console.log("Make", make);
//       if (!make) return res.status(400).json(failureResponse("Make not found.", null, 400));
//     }
//   } catch (err) {
//     return res.status(400).json(failureResponse("Invalid Make ID.", null, 400));
//   }

//   const { error, value } = schema.validate(req.body);
//   if (error) return res.status(400).json(failureResponse(error.details[0].message));

//   try {
//     const vehicleModel = await VehicleModel.findByIdAndUpdate(req.params.id, value, { new: true });
//     if (!vehicleModel) return res.status(404).json(failureResponse("Vehicle model not found.", null, 404));
//     res.status(200).json(successResponse("Vehicle model updated successfully.", { vehicleModel }));
//   } catch (err) {
//     console.error("Update Vehicle Model Error:", err);
//     res.status(500).json(failureResponse("Internal server error.", null, 500));
//   }
// };

// const deleteVehicleModel = async (req: AuthenticatedRequest, res: Response) => {
//   if (req.user?.user_type !== "Admin") {
//     return res.status(403).json(failureResponse("Only admins can delete vehicle models.", null, 403));
//   }

//   try {
//     const vehicleModel = await VehicleModel.findByIdAndDelete(req.params.id);
//     if (!vehicleModel) return res.status(404).json(failureResponse("Vehicle model not found.", null, 404));
//     res.status(200).json(successResponse("Vehicle model deleted successfully.", null));
//   } catch (err) {
//     console.error("Delete Vehicle Model Error:", err);
//     res.status(500).json(failureResponse("Internal server error.", null, 500));
//   }
// };

export {
  createMake,
  getAllMakes,
  updateMake,
  deleteMake,
  // createVehicleModel,
  // getAllVehicleModels,
  // updateVehicleModel,
  // deleteVehicleModel,
  // getVehicleModelById,
};
