import { Request, Response } from "express";
import VendorVehiclePrivacyPolicyModel from "../models/vendor_vehicle_privact_policy.model";
import Vendor from "../models/vendor.model";
import { AuthenticatedRequest } from "../types/auth";
import { successResponse, failureResponse } from "../utils/response";
import Joi from "joi";

// Create vendor vehicle privacy policy
export const createVendorVehiclePrivacyPolicy = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const vendor_id = req.user?._id;
    
    if (!vendor_id) {
      return res.status(400).json(failureResponse("Vendor ID is required", null, 400));
    }

    const vendor = await Vendor.findOne({ user_id: vendor_id });
    if (!vendor) {
      return res.status(400).json(failureResponse("Vendor not found", null, 400));
    }

    const schema = Joi.object({
      cancellation_policy: Joi.string().required(),
      terms_conditions: Joi.string().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json(failureResponse(error.details[0].message));
    }

    const existingPolicy = await VendorVehiclePrivacyPolicyModel.findOne({ vendor_id: vendor._id });
    if (existingPolicy) {
      return res.status(400).json(failureResponse("Privacy policy already exists for this vendor", null, 400));
    }

    const privacyPolicy = new VendorVehiclePrivacyPolicyModel({
      vendor_id: vendor._id,
      ...value
    });

    await privacyPolicy.save();

    return res.status(201).json(successResponse(
      "Privacy policy created successfully",
      { privacyPolicy },
      201
    ));

  } catch (error) {
    console.error("Create Privacy Policy Error:", error);
    return res.status(500).json(failureResponse("Error creating privacy policy", null, 500));
  }
};

// Get vendor vehicle privacy policy
export const getVendorVehiclePrivacyPolicy = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user_id = req.user?._id;
    if (!user_id) {
        console.log("User ID is required");
      return res.status(400).json(failureResponse("User ID is required", null, 400));
    }

    const vendor = await Vendor.findOne({ user_id: user_id });
    if (!vendor) {
        console.log("Vendor not found");
      return res.status(400).json(failureResponse("Vendor not found", null, 400));
    }

    const privacyPolicy = await VendorVehiclePrivacyPolicyModel.findOne({ vendor_id:vendor._id });
    
    if (!privacyPolicy) {
        console.log("Privacy policy not found");
      return res.status(404).json(failureResponse("Privacy policy not found", null, 404));
    }

    return res.status(200).json(successResponse(
      "Privacy policy fetched successfully",
      { privacyPolicy },
      200
    ));

  } catch (error) {
    console.error("Get Privacy Policy Error:", error);
    return res.status(500).json(failureResponse("Error fetching privacy policy", null, 500));
  }
};

// Update vendor vehicle privacy policy
export const updateVendorVehiclePrivacyPolicy = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const vendor_id = req.user?._id;

    if (!vendor_id) {
      return res.status(400).json(failureResponse("Vendor ID is required", null, 400));
    }

    const vendor = await Vendor.findOne({ user_id: vendor_id });
    if (!vendor) {
      return res.status(400).json(failureResponse("Vendor not found", null, 400));
    }

    const schema = Joi.object({
      cancellation_policy: Joi.string(),
      terms_conditions: Joi.string()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json(failureResponse(error.details[0].message));
    }

    const updatedPolicy = await VendorVehiclePrivacyPolicyModel.findOneAndUpdate(
      { vendor_id: vendor._id },
      { $set: value },
      { new: true }
    );

    if (!updatedPolicy) {
      return res.status(404).json(failureResponse("Privacy policy not found", null, 404));
    }

    return res.status(200).json(successResponse(
      "Privacy policy updated successfully",
      { privacyPolicy: updatedPolicy },
      200
    ));

  } catch (error) {
    console.error("Update Privacy Policy Error:", error);
    return res.status(500).json(failureResponse("Error updating privacy policy", null, 500));
  }
};

// Delete vendor vehicle privacy policy
export const deleteVendorVehiclePrivacyPolicy = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const vendor_id = req.user?._id;

    if (!vendor_id) {
      return res.status(400).json(failureResponse("Vendor ID is required", null, 400));
    }

    const vendor = await Vendor.findOne({ user_id: vendor_id });
    if (!vendor) {
      return res.status(400).json(failureResponse("Vendor not found", null, 400));
    }

    const deletedPolicy = await VendorVehiclePrivacyPolicyModel.findOneAndDelete({ vendor_id: vendor._id });

    if (!deletedPolicy) {
      return res.status(404).json(failureResponse("Privacy policy not found", null, 404));
    }

    return res.status(200).json(successResponse(
      "Privacy policy deleted successfully",
      null,
      200
    ));

  } catch (error) {
    console.error("Delete Privacy Policy Error:", error);
    return res.status(500).json(failureResponse("Error deleting privacy policy", null, 500));
  }
};
