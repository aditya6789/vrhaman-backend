import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import VendorVehicle from '../models/vendor_vehicle.model';
import BookingModel from '../models/booking.model';
import { successResponse, failureResponse } from '../utils/response';
import mongoose from 'mongoose';

export class VehiclePreferenceController {
    // Get Popular Bikes
    async getPopularBikes(req: Request, res: Response) {
        try {
            const popularBikes = await VendorVehicle.aggregate([
                {
                    $lookup: {
                        from: 'bookings',
                        localField: '_id',
                        foreignField: 'vehicle_id',
                        as: 'bookings'
                    }
                },
                {
                    $lookup: {
                        from: 'vehicles',
                        localField: 'vehicle_id',
                        foreignField: '_id',
                        as: 'vehicleDetails'
                    }
                },
                {
                    $match: {
                        'vehicleDetails.type': 'Bike'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        vehicle_id: 1,
                        images: 1,
                        daily_rate: 1,
                        availability_status: 1,
                        booking_count: { $size: '$bookings' },
                        vehicleDetails: { $arrayElemAt: ['$vehicleDetails', 0] }
                    }
                },
                {
                    $sort: { booking_count: -1 }
                },
                {
                    $limit: 10
                }
            ]);

            return res.status(200).json(successResponse('Popular bikes retrieved successfully', popularBikes));
        } catch (error) {
            console.error('Error getting popular bikes:', error);
            return res.status(500).json(failureResponse('Error retrieving popular bikes'));
        }
    }

    // Get Popular Cars
    async getPopularCars(req: Request, res: Response) {
        try {
            const popularCars = await VendorVehicle.aggregate([
                {
                    $lookup: {
                        from: 'bookings',
                        localField: '_id',
                        foreignField: 'vehicle_id',
                        as: 'bookings'
                    }
                },
                {
                    $lookup: {
                        from: 'vehicles',
                        localField: 'vehicle_id',
                        foreignField: '_id',
                        as: 'vehicleDetails'
                    }
                },
                {
                    $match: {
                        'vehicleDetails.type': 'Car'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        vehicle_id: 1,
                        images: 1,
                        daily_rate: 1,
                        availability_status: 1,
                        booking_count: { $size: '$bookings' },
                        vehicleDetails: { $arrayElemAt: ['$vehicleDetails', 0] }
                    }
                },
                {
                    $sort: { booking_count: -1 }
                },
                {
                    $limit: 10
                }
            ]);

            return res.status(200).json(successResponse('Popular cars retrieved successfully', popularCars));
        } catch (error) {
            console.error('Error getting popular cars:', error);
            return res.status(500).json(failureResponse('Error retrieving popular cars'));
        }
    }

    // Get User Preferred Vehicles
    async getUserPreferredVehicles(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json(failureResponse('User not authenticated'));
            }

            // Get user's booking history
            const userBookings = await BookingModel.find({ customer_id: userId });
            console.log(userBookings);
            const vehicleIds = userBookings.map(booking => booking.vehicle_id);
            console.log(vehicleIds);

            // Find similar vehicles based on user's booking history
            const preferredVehicles = await VendorVehicle.find({
                '_id': { $in: vehicleIds }
            }).populate('vehicle_id');

            return res.status(200).json(successResponse('User preferred vehicles retrieved successfully', preferredVehicles));
        } catch (error) {
            console.error('Error getting user preferred vehicles:', error);
            return res.status(500).json(failureResponse('Error retrieving user preferred vehicles'));
        }
    }

    // Get Best Deals
    async getBestDeals(req: Request, res: Response) {
        try {
            const bestDeals = await VendorVehicle.aggregate([
                {
                    $lookup: {
                        from: 'vehicles',
                        localField: 'vehicle_id',
                        foreignField: '_id',
                        as: 'vehicleDetails'
                    }
                },
                {
                    $unwind: '$vehicleDetails'
                },
                {
                    $match: {
                        availability_status: 'Available',
                    }
                },
                {
                    $project: {
                        _id: 1,
                        vehicle_id: 1,
                        images: 1,
                        daily_rate: 1,
                        availability_status: 1,
                        vehicleDetails: 1
                    }
                },
                {
                    $sort: { daily_rate: 1 }
                },
                {
                    $limit: 10
                }
            ]);

            return res.status(200).json(successResponse('Best deals retrieved successfully', bestDeals));
        } catch (error) {
            console.error('Error getting best deals:', error);
            return res.status(500).json(failureResponse('Error retrieving best deals'));
        }
    }

    // Get Trending Vehicles (Based on recent bookings)
    async getTrendingVehicles(req: Request, res: Response) {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const trendingVehicles = await BookingModel.aggregate([
                {
                    $match: {
                        created_at: { $gte: thirtyDaysAgo },
                        status: 'Completed'
                    }
                },
                {
                    $group: {
                        _id: '$vehicle_id',
                        bookingCount: { $sum: 1 }
                    }
                },
                {
                    $sort: { bookingCount: -1 }
                },
                {
                    $limit: 10
                },
                {
                    $lookup: {
                        from: 'vendorvehicles',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'vehicleDetails'
                    }
                }
            ]);

            return res.status(200).json(successResponse('Trending vehicles retrieved successfully', trendingVehicles));
        } catch (error) {
            console.error('Error getting trending vehicles:', error);
            return res.status(500).json(failureResponse('Error retrieving trending vehicles'));
        }
    }
}

export default new VehiclePreferenceController();
