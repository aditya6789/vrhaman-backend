import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { failureResponse, successResponse } from "../utils/response";
import { AuthenticatedRequest } from "../types/auth";
import customerDocumentModel from "../models/customerDocument.model";
import VendorModel from "../models/vendor.model";
import BookingModel from "../models/booking.model";
import Vehicle from "../models/vehicle.model";
import Joi from "joi";
import userModel from "../models/user.model";
import addressModel from "../models/address.model";

export const userController = {
  // Get user profile
  async getUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json(failureResponse("User not found"));
      }
      res.json(successResponse("User retrieved successfully", user));
    } catch (error) {
      res.status(500).json(failureResponse("Server error"));
    }
  },

  // Update user profile
  async updateUser(req: AuthenticatedRequest, res: Response) {
    console.log(req.file)
    console.log('running')
    console.log(req.body)
    try {
      const updates = req.body;
      if (req.file) {
        updates.profile_picture = req.file.filename;
      }
      const user = await User.findByIdAndUpdate(req.user?._id, updates, {
        new: true,
      });
      if (!user) {
        return res.status(404).json(failureResponse("User not found"));
      }
      res.json(successResponse("User updated successfully", user));
    } catch (error) {
      res.status(500).json(failureResponse("Server error"));
    }
  },

  // Delete user
  async deleteUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        return res.status(404).json(failureResponse("User not found"));
      }
      return res.status(200).json(successResponse("User deleted successfully", user));
    } catch (error: any) {
      console.error("Error deleting user:", error);
      return res.status(500).json(failureResponse("Server error"));
    }
  },

  // Get all users
  async getAllUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await User.find();
      return res.status(200).json(successResponse("Users retrieved successfully", users));
    } catch (error: any) {
      console.error("Error retrieving users:", error);
      return res.status(500).json(failureResponse("Server error"));
    }
  },
  async getAllCustomers(req: AuthenticatedRequest, res: Response) {
    try {
      const customers = await User.find({ user_type: "Customer" });
      return res.status(200).json(successResponse("Customers retrieved successfully", customers));
    } catch (error: any) {
      console.error("Error retrieving customers:", error);
      return res.status(500).json(failureResponse("Server error"));
    }
  },
  async getCustomerDocument(req: AuthenticatedRequest, res: Response) {
    console.log(req.user)
    console.log('running')
    const userId = req.user?._id;
    if (!userId) {
      console.log('user not found')
      return res.status(400).json(failureResponse("User not found"));
    }
    if (req.user?.user_type !== "customer") {
      console.log('user is not a customer')
      return res.status(400).json(failureResponse("User is not a customer"));
    }
    try {
      const customerDocument = await customerDocumentModel.find({ user_id: userId });
      return res.status(200).json(successResponse("Customer document retrieved successfully", customerDocument));
    } catch (error: any) {
      console.log('server error')
      console.log(error)
      return res.status(500).json(failureResponse(error.message));
    }
  },

  async uploadCustomerDocument(req: AuthenticatedRequest, res: Response) {
    console.log(req.file);
    console.log('running')
    const userId = req.user?._id;
    const document = req.file?.filename; // Access the file name
    if (!userId) {
      return res.status(400).json(failureResponse("User not found"));
    }
    if (!document) {
      return res.status(400).json(failureResponse("Document not found"));
    }
    if (req.user?.user_type !== "customer") {
      return res.status(400).json(failureResponse("User is not a customer"));
    }
    try {

      const customerDocument = new customerDocumentModel({ user_id: req.user?._id, document });
      await customerDocument.save();
      return res.status(200).json(successResponse("Customer document uploaded successfully", customerDocument));
    } catch (error: any) {
      return res.status(500).json(failureResponse("Server error"));
    }
  },
  async addAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const { address, city, state, postalCode, latitude, longitude, isDefault } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(400).json(failureResponse("User not found"));
      }

      let userAddress = await addressModel.findOne({ user_id: userId });

      const newAddressData = {
        address,
        city, 
        state,
        postalCode,
        isDefault: isDefault || false,
        latitude,
        longitude
      };

      if (!userAddress) {
        userAddress = await addressModel.create({
          user_id: userId,
          addresses: [newAddressData]
        });
      } else {
        if (isDefault) {
          userAddress.addresses.forEach(addr => addr.isDefault = false);
        }
        userAddress.addresses.push(newAddressData);
        await userAddress.save();
      }

      return res.status(200).json(successResponse("Address added successfully", userAddress));
    } catch (error: any) {
      return res.status(500).json(failureResponse(error.message));
    }
  },

  async getAddress(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?._id;
    const address = await addressModel.findOne({ user_id: userId });
    return res.status(200).json(successResponse("Address retrieved successfully", address));
  },

  async getVendorProfile(req: AuthenticatedRequest, res: Response) {
    if (req.user?.user_type !== "Vendor") {
      return res.status(400).json(failureResponse("User is not a vendor"));
    }
    try {

      const vendor = await VendorModel.findOne({ user_id: req.user?._id });

      // booking completed
      const bookingCompleted = await BookingModel.find({ vendor_id: req.user?._id, status: "Completed" });
      const bookingCompletedCount = bookingCompleted.length;

      // revenue
      const revenue = bookingCompleted.reduce((acc, booking) => acc + booking.total_price, 0);

      // todays revenue
      const todaysDate = new Date();
      const todaysRevenue = bookingCompleted.filter((booking) => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate.toDateString() === todaysDate.toDateString();
      });

      // todays booking
      const todaysBookingCompletedCount = bookingCompleted.filter((booking) => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate.toDateString() === todaysDate.toDateString();
      }).length;


      // vendor vehicles
      // const vendorVehicles = await Vehicle.find({ vendor_id: req.user?._id });
      if (!vendor) {
        return res.status(400).json(failureResponse("Vendor not found"));
      }
      return res.status(200).json(successResponse("Vendor profile retrieved successfully", {
        vendor,
        revenue,
        todaysRevenue,
        bookingCompletedCount,
        todaysBookingCompletedCount,
        // vendorVehicles
      }));

    } catch (error: any) {
      return res.status(500).json(failureResponse("Server error"));
    }
  },


  async getAllVendors(req: AuthenticatedRequest, res: Response) {
    if (req.user?.user_type !== "admin") {
      return res.status(400).json(failureResponse("User is not an admin"));
    }
    try {
      const vendors = await VendorModel.find()
        .populate('user_id', 'name email phone is_active ')
        .select('-__v');

      return res.status(200).json(successResponse("Vendors retrieved successfully", vendors));
    } catch (error: any) {
      console.error("Get All Vendors Error:", error);
      return res.status(500).json(failureResponse("Server error"));
    }
  },
  async updateVendorProfile(req: AuthenticatedRequest, res: Response) {
    console.log('running updateVendorProfile')
    if (req.user?.user_type !== "vendor") {
      console.log('user is not a vendor')
      return res.status(400).json(failureResponse("User is not a vendor"));
    }

    try {
      // Find and update only specified fields, preserving existing data
      const vendor = await VendorModel.findOneAndUpdate(
        { user_id: req.user?._id },
        { $set: req.body },
        { 
          new: true,
          runValidators: true,
          context: 'query'
        }
      );

      if (!vendor) {
        return res.status(404).json(failureResponse("Vendor profile not found"));
      }

      return res.status(200).json(successResponse("Vendor profile updated successfully", vendor));

    } catch (error: any) {
      console.log('server error', error)
      return res.status(500).json(failureResponse("Server error"));
    }
  },
  async getVendor(req: AuthenticatedRequest, res: Response) {
    console.log('running getVendor')
    if (req.user?.user_type !== "vendor") {
      return res.status(400).json(failureResponse("User is not a vendor"));
    }
    try {
      const vendor = await VendorModel.findOne({ user_id: req.user?._id })
        .populate('user_id', 'name email phone')
        .select('-__v');

      if (!vendor) {
        return res.status(404).json(failureResponse("Vendor not found"));
      }
      console.log(vendor)

      return res.status(200).json(successResponse("Vendor retrieved successfully", vendor));
    } catch (error: any) {
      console.error("Get Vendor Error:", error);
      return res.status(500).json(failureResponse("Server error")); 
    }
  },
  async getVendorDetails(req: AuthenticatedRequest, res: Response) {
    console.log('running getVendor')
    if (req.user?.user_type !== "admin") {
      return res.status(400).json(failureResponse("User is not an admin"));
    }
    try {
      const vendor = await VendorModel.findOne({ user_id: req.params.userId })
        .populate('user_id', 'name email phone is_active _id')
        .populate('id_proof' , 'id_image')
        .select('-__v');

      if (!vendor) {
        return res.status(404).json(failureResponse("Vendor not found"));
      }
      console.log(vendor)
      

      return res.status(200).json(successResponse("Vendor retrieved successfully", vendor));
    } catch (error: any) {
      console.error("Get Vendor Error:", error);
      return res.status(500).json(failureResponse("Server error")); 
    }
  },
  // check vendor profile
  async checkVendorProfile(req: AuthenticatedRequest, res: Response) {
    console.log(req.user)
    console.log("Checking Vendor Profile");
    if (req.user?.user_type !== "Vendor") {
      console.log("User is not a vendor");
      return res.status(400).json(failureResponse("User is not a vendor"));
    }
    const vendor = await VendorModel.findOne({ user_id: req.user?._id });
    if (!vendor) {
      console.log("Vendor profile not found");
      return res.status(404).json(failureResponse("Vendor profile not found"));
    }
    return res.status(200).json(successResponse("Vendor profile retrieved successfully", vendor));

  },
  async getVendorStatus(req: AuthenticatedRequest, res: Response) {
    console.log(req.user)
    console.log('running getVendorStatus')
    if ( req.user?.user_type !== "vendor") {
      return res.status(400).json(failureResponse("User is not an admin or vendor"));
    }
    const vendor = await userModel.findOne({ _id: req.user?._id });
    return res.status(200).json(successResponse("Vendor status retrieved successfully", vendor));
  },

  async updateVendorStatus(req: AuthenticatedRequest, res: Response) {
    if (req.user?.user_type !== "admin") {
      return res.status(400).json(failureResponse("User is not an admin"));
    }
    const vendor = await userModel.findOne({ _id: req.params.userId });
    if (!vendor) {
      return res.status(404).json(failureResponse("Vendor not found"));
    }
    vendor.is_active = req.body.is_active;
    await vendor.save();
    return res.status(200).json(successResponse("Vendor status updated successfully", vendor));
  }

};

export default userController;
