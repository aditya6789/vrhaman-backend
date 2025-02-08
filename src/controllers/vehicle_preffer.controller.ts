import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import VendorVehicle from '../models/vendor_vehicle.model';
import BookingModel from '../models/booking.model';
import { successResponse, failureResponse } from '../utils/response';
import mongoose from 'mongoose';
import reviewModel from '../models/review.model';

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
                        'vehicleDetails.type': 'Bike',
                        'bookings': { $exists: true, $ne: [] } // Only get bikes that have bookings
                    }
                },
                {
                    $addFields: {
                        booking_count: { $size: '$bookings' }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        vehicle_id: 1,
                        images: 1,
                        daily_rate: 1,
                        availability_status: 1,
                        booking_count: 1,
                        vehicleDetails: { $arrayElemAt: ['$vehicleDetails', 0] }
                    }
                },
                {
                    $sort: { booking_count: -1 } // Sort by most bookings first
                },
                {
                    $limit: 10 // Get top 10 most booked bikes
                }
            ]);

            const bikesWithRatings :any = await Promise.all(popularBikes.map(async bike => {
                const reviews = await reviewModel.find({vehicleId: bike._id}).exec();
                const avgRating = reviews.length > 0 
                    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
                    : 0
                return {
                    ...bike,
                    average_rating: Number(avgRating.toFixed(1)),
                    review_count: reviews.length
                };
            }));
            
            

            

            return res.status(200).json(successResponse('Popular bikes retrieved successfully',  bikesWithRatings));
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
                        'vehicleDetails.type': 'car',
                        'bookings': { $exists: true, $ne: [] } // Only get bikes that have bookings
                    }
                },
                {
                    $addFields: {
                        booking_count: { $size: '$bookings' }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        vehicle_id: 1,
                        images: 1,
                        daily_rate: 1,
                        availability_status: 1,
                        booking_count: 1,
                        vehicleDetails: { $arrayElemAt: ['$vehicleDetails', 0] }
                    }
                },
                {
                    $sort: { booking_count: -1 } // Sort by most bookings first
                },
                {
                    $limit: 10 // Get top 10 most booked bikes
                }
            ]);

            const carsWithRatings :any = await Promise.all(popularCars.map(async car => {
                const reviews = await reviewModel.find({vehicleId: car._id}).exec();
                const avgRating = reviews.length > 0 
                    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 

                    : 0
                return {
                    ...car,
                    average_rating: Number(avgRating.toFixed(1)),
                    review_count: reviews.length
                };

            }));

            return res.status(200).json(successResponse('Popular cars retrieved successfully', carsWithRatings));

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

            const userBookings = await BookingModel.find({ customer_id: userId });
            const vehicleIds = userBookings.map(booking => booking.vehicle_id);

            const preferredVehicles = await VendorVehicle.find({
                '_id': { $in: vehicleIds }
            }).populate('vehicle_id').lean(); // Add lean() to get plain objects

            const preferredVehiclesWithRatings = await Promise.all(preferredVehicles.map(async vehicle => {
                const reviews = await reviewModel.find({ vehicleId: vehicle._id }).lean();
                const avgRating = reviews.length > 0 
                    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
                    : 0;

                return {
                    ...vehicle,
                    average_rating: Number(avgRating.toFixed(1)),
                    review_count: reviews.length
                };
            }));

            return res.status(200).json(successResponse(
                'User preferred vehicles retrieved successfully', 
                preferredVehiclesWithRatings
            ));
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
