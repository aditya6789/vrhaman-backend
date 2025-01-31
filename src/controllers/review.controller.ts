import { Request, Response } from 'express';
import VehicleModel from '../models/vehicle.model';
import reviewModel from '../models/review.model';
import { AuthenticatedRequest } from '../types/auth';


// Create a new review
export const createReview = async (req: AuthenticatedRequest, res: Response) => {
    console.log(req.body);
  try {
    const { vehicle, rating, comment } = req.body;
    const userId = req.user?._id; // Assuming user ID is extracted from auth middleware

    // Check if the vehicle exists
    const vehicleData = await VehicleModel.findById(vehicle);
    if (!vehicleData) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Create a new review
    const review = new reviewModel({
      user: userId,
      vehicle: vehicle,
      rating,
      comment,
    });

    await review.save();
    res.status(201).json({ message: 'Review created successfully', review });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

// Get all reviews for a vehicle
export const getVehicleReviews = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;

    const reviews = await reviewModel.find({ vehicle: vehicleId }).populate('user', 'name');
    if (!reviews || reviews.length === 0) {
      console.log("No reviews found for this vehicle");
      return res.status(400).json({ message: 'No reviews found for this vehicle' });
    }

    res.status(200).json({ reviews });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving reviews', error: error.message });
  }
};
