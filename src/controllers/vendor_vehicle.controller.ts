import { Request, Response } from "express";
import VendorVehicle from "../models/vendor_vehicle.model";
import { failureResponse, successResponse } from "../utils/response";
import { Request as ExpressRequest } from 'express';
import { AuthenticatedRequest } from "../types/auth";
import vendorModel from "../models/vendor.model";
import bookingModel from "../models/booking.model";
import vendor_vehicle_privact_policyModel from "../models/vendor_vehicle_privact_policy.model";


const VendorVehicleController = {
  // create vendor vehicle
  async createVendorVehicle(req: AuthenticatedRequest, res: Response) {
    const vendor_id = req.user?._id;
    const vendor = await vendorModel.findOne({user_id: vendor_id});
    if(!vendor){
      console.log("Vendor not found");
      return res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
    }
    try {
        const {
            
            vehicle_id,
            daily_rate,
            weekly_rate,
            monthly_rate,
            color,
            vehicle_number,
            delivery_fee,
            available_delivery,
            two_day_rate,
            three_day_rate,
            four_day_rate,
            five_day_rate,
            six_day_rate,
            // one_week_rate,
            two_week_rate,
            three_week_rate,
            // one_month_rate,
            two_month_rate,
            three_month_rate,
            images
        } = req.body;

        // Add these debug logs at the start of createVendorVehicle
        console.log("Request body:", req.body);
        console.log("Request files:", req.files);
        console.log("Content-Type:", req.headers['content-type']);

        // Add this debug log
        console.log("Received rate fields:", {
            daily_rate,
            two_day_rate,
            three_day_rate,
            four_day_rate,
            five_day_rate,
            six_day_rate,
            // one_week_rate,
            two_week_rate,
            three_week_rate,
            // one_month_rate,
            two_month_rate,
            three_month_rate,
            delivery_fee,
            weekly_rate,
            monthly_rate,
        });

        // Validate that required fields exist
        if (!available_delivery) {
          console.log("available_delivery is required");
            return res.status(400).json({
                success: false,
                message: "available_delivery is required"
            });
        }

        // Validate that all rate fields are valid numbers
        const rateFields = {
            daily_rate,
            two_day_rate,
            three_day_rate,
            four_day_rate,
            five_day_rate,
            six_day_rate,
            // one_week_rate,
            two_week_rate,
            three_week_rate,
            // one_month_rate,
            two_month_rate,
            three_month_rate,
            delivery_fee,
            weekly_rate,
            monthly_rate,
        };

        // Check if any rate field is not a valid number
        for (const [key, value] of Object.entries(rateFields)) {
            if (isNaN(Number(value))) {
                console.log(`Invalid number for ${key}`);
                return res.status(400).json({
                    success: false,
                    message: `Invalid number for ${key}`
                });
            }
        }

   
        
        const vendorVehicle = new VendorVehicle({
          vendor_id: vendor._id,
            vehicle_id,
            daily_rate: Number(daily_rate),
            weekly_rate: Number(weekly_rate),
            monthly_rate: Number(monthly_rate),
            delivery_fee: Number(delivery_fee),
            available_delivery,
            images,
            two_day_rate: Number(two_day_rate),
            three_day_rate: Number(three_day_rate),
            four_day_rate: Number(four_day_rate),
            five_day_rate: Number(five_day_rate),
            six_day_rate: Number(six_day_rate),
            // one_week_rate: Number(one_week_rate),
            two_week_rate: Number(two_week_rate),
            three_week_rate: Number(three_week_rate),
            // one_month_rate: Number(one_month_rate),
            two_month_rate: Number(two_month_rate),
            three_month_rate: Number(three_month_rate),
            color,
            vehicle_number,
        });

        await vendorVehicle.save();
        
        
        res.status(201).json(successResponse("Vendor vehicle created successfully.", { vendorVehicle }));
    } catch (error:any) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
  },

  async getAllVendorVehicles(req: AuthenticatedRequest, res: Response) {
    console.log("Running getAllVendorVehicles");

    const vendorVehicles = await VendorVehicle.find().populate('vehicle_id');
    res.status(200).json(successResponse("Vendor vehicles fetched successfully.", { vendorVehicles }));
  },

  // get all vendor vehicles
  async getAllVendorProfileVehicles(req: AuthenticatedRequest, res: Response) {
    const user_id = req.user?._id;
    console.log("user_id", user_id);
    const vendor = await vendorModel.findOne({user_id: user_id});
    if(!vendor){
      console.log("Vendor not found");
      return res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
    }

    const vendorVehicles = await VendorVehicle.find({
      vendor_id: vendor._id,
    }).populate({
      path: "vehicle_id",
      model: "Vehicle",
      // select: 'make model type variants body_type'
    });

    // Populate vehicle model details and join with vendor vehicles

    if (!vendorVehicles || vendorVehicles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No vehicles found for this vendor",
      });
    }

    // Filter out entries with null vehicle_id
    const validVendorVehicles = vendorVehicles.filter(
      (vehicle) => vehicle.vehicle_id !== null
    );

    if (validVendorVehicles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No valid vehicles found for this vendor",
      });
    }

    // // Populate only valid vehicle entries
    // const populatedVehicles = await VendorVehicle.populate(validVendorVehicles, {
    //     path: 'vehicle_id',
    //     model: 'Vehicle'
    // });

    // console.log("Found vehicles:", JSON.stringify(vendorVehicles, null, 2));
    res
      .status(200)
      .json(
        successResponse("Vendor vehicles fetched successfully.", {
          vendorVehicles,
        })
      );
  },

  async getVehicleDetails(req: AuthenticatedRequest, res: Response) {
    console.log("Running getVehicleDetails");
    const { id } = req.query;
    const vendorVehicle = await VendorVehicle.findById(id).populate('vehicle_id').populate('vendor_id');
    const privacyPolicy = await vendor_vehicle_privact_policyModel.findOne({vendor_id: vendorVehicle?.vendor_id});
    console.log("privacyPolicy", privacyPolicy);
    res.status(200).json(successResponse("Vendor vehicle fetched successfully.", { vendorVehicle , privacyPolicy }));
  },


  // get vendor vehicle by id
  async getVendorVehicleById(req: Request, res: Response) {
    const { id } = req.params;
    const vendorVehicle = await VendorVehicle.findById(id);

    res
      .status(200)
      .json(
        successResponse("Vendor vehicle fetched successfully.", {
          vendorVehicle,
        })
      );
  },
  async updateVendorVehicle(req: AuthenticatedRequest, res: Response) {
    console.log("Running updateVendorVehicle");
    console.log("req.body", req.body);
    const  user_id = req.user?._id;
    const {vehicle_id} = req.params;
    console.log("vehicle_id", vehicle_id);
    const vendor = await vendorModel.findOne({user_id: user_id});
    if(!vendor){
      console.log("Vendor not found");
      return res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
    }
    const vendorVehicle = await VendorVehicle.findOne({_id: vehicle_id});
    if(!vendorVehicle){
      console.log("Vendor vehicle not found");
      return res.status(404).json({
        success: false,
        message: "Vendor vehicle not found"
      });
    }
    try {
      const updatedData = req.body;
      const updatedVendorVehicle = await VendorVehicle.findByIdAndUpdate(
        vendorVehicle._id,
        updatedData,
        { new: true }
      );

      if (!updatedVendorVehicle) {
        console.log("Failed to update vendor vehicle");
        return res.status(404).json({
          success: false,
          message: "Failed to update vendor vehicle"
        });
      }
      console.log("Vendor vehicle updated successfully");
      return res.status(200).json({
        success: true,
        message: "Vendor vehicle updated successfully",
        data: updatedVendorVehicle
      });

    } catch (error) {
      console.error("Error updating vendor vehicle:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  },

  async updateVendorVehicleStatus(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    const vendorVehicle = await VendorVehicle.findByIdAndUpdate(id, { availability_status: status }, { new: true });
    res.status(200).json(successResponse("Vendor vehicle status updated successfully.", { vendorVehicle }));
  },

  // delete vendor vehicle
  async deleteVendorVehicle(req: Request, res: Response) {
    console.log("Running deleteVendorVehicle");
    const { id } = req.params;
    console.log("vehicle_id", id);

    // Check for any active bookings associated with this vehicle
    const bookings = await bookingModel.find({
      vehicle_id: id,
      status: { $in: ["Pending", "Confirmed", "Ongoing", "Accepted"] }
    });

    if (bookings.length > 0) {
      // Vehicle has active bookings, cannot delete
      console.log("Vehicle has active bookings - cannot delete");
      return res.status(400).json(failureResponse("Cannot delete vehicle - it has active bookings"));
    }

    // No active bookings found, proceed with deletion
    await VendorVehicle.findByIdAndDelete(id);

    // Delete any related completed/cancelled bookings
    await bookingModel.deleteMany({ vehicle_id: id });

    console.log("Vehicle and related bookings deleted successfully");
    return res.status(200).json(
      successResponse("Vendor vehicle and related bookings deleted successfully")
    );
  },

 
};

export default VendorVehicleController;
