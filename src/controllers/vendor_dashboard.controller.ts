import { Request, Response } from 'express';

import BookingModel from '../models/booking.model';
import { AuthenticatedRequest } from '../types/auth';
import { failureResponse, successResponse } from '../utils/response';
import userModel from '../models/user.model';
import Vendor from '../models/vendor.model';


// Get vendor earnings statistics
const getVendorEarnings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user_id = req?.user?._id;
    if (!user_id) {
      return res.status(400).json(failureResponse("User ID is required", null, 400));
    }

    // First get the Vendor document using the user_id
    const vendor = await Vendor.findOne({ user_id: user_id });
    if (!vendor) {
      return res.status(400).json(failureResponse("Vendor not found", null, 400));
    }
    
    console.log('Vendor found:', vendor); // Log vendor details

    // Get current date
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Use aggregation pipeline to get earnings
    const bookingStats = await BookingModel.aggregate([
      {
        $match: {
          vendor_id: vendor._id,
          status: { $in: ["Confirmed", "Completed"] }
        }
      },
      {
        $facet: {
          today: [
            {
              $match: {
                start_date: { $gte: startOfToday }
              }
            },
            {
              $group: {
                _id: null,
                earnings: { $sum: "$total_price" },
                bookingCount: { $sum: 1 }
              }
            }
          ],
          weekly: [
            {
              $match: {
                start_date: { $gte: startOfWeek }
              }
            },
            {
              $group: {
                _id: null,
                earnings: { $sum: "$total_price" },
                bookingCount: { $sum: 1 }
              }
            }
          ],
          monthly: [
            {
              $match: {
                start_date: { $gte: startOfMonth }
              }
            },
            {
              $group: {
                _id: null,
                earnings: { $sum: "$total_price" },
                bookingCount: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    console.log('Aggregation Results:', JSON.stringify(bookingStats, null, 2));

    const [stats] = bookingStats;
    
    const earnings = {
      today: {
        earnings: stats.today[0]?.earnings || 0,
        bookingCount: stats.today[0]?.bookingCount || 0,
        startDate: startOfToday,
        endDate: now
      },
      weekly: {
        earnings: stats.weekly[0]?.earnings || 0,
        bookingCount: stats.weekly[0]?.bookingCount || 0,
        startDate: startOfWeek,
        endDate: now
      },
      monthly: {
        earnings: stats.monthly[0]?.earnings || 0,
        bookingCount: stats.monthly[0]?.bookingCount || 0,
        startDate: startOfMonth,
        endDate: now
      }
    };

    return res.status(200).json(successResponse(
      "Earnings fetched successfully",
      earnings,
      200
    ));

  } catch (error) {
    console.error("Get Vendor Earnings Error:", error);
    return res.status(500).json(failureResponse(
      "Error fetching earnings",
      null,
      500
    ));
  }
};
// Get earnings breakdown for vendor
export const getVendorEarningsBreakdown = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const vendor_id = req.user?._id;
    const { period } = req.query; // 'weekly' or 'monthly'

    if (!vendor_id) {
      return res.status(400).json(failureResponse("Vendor ID is required", null, 400));
    }

    const vendor = await Vendor.findOne({ user_id: vendor_id });
    if (!vendor) {
      return res.status(400).json(failureResponse("Vendor not found", null, 400));
    }

    const now = new Date();
    let startDate: Date;
    let dateFormat: string;

    // Set start date and format based on period
    if (period === 'weekly') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      dateFormat = 'YYYY-MM-DD';
    } else if (period === 'monthly') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      dateFormat = 'YYYY-MM-DD';
    } else {
      return res.status(400).json(failureResponse("Invalid period specified", null, 400));
    }

    // Get all bookings for the specified period
    const bookings = await BookingModel.find({
      vendor_id: vendor._id,
      status: { $in: ["Confirmed", "Completed"] },
      created_at: {
        $gte: startDate,
        $lte: now
      }
    }).sort({ created_at: -1 });

    // Group bookings by date
    const breakdownMap = new Map();
    
    bookings.forEach(booking => {
      const date = booking.created_at.toISOString().split('T')[0];
      
      if (!breakdownMap.has(date)) {
        breakdownMap.set(date, {
          date,
          earnings: 0,
          bookingCount: 0
        });
      }
      
      const dayData = breakdownMap.get(date);
      dayData.earnings += booking.total_price;
      dayData.bookingCount += 1;
    });

    // Convert map to array and ensure all dates in range are included
    const breakdown = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = breakdownMap.get(dateStr) || {
        date: dateStr,
        earnings: 0,
        bookingCount: 0
      };
      breakdown.push(dayData);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return res.status(200).json(successResponse(
      "Earnings breakdown fetched successfully",
      {
        period,
        startDate,
        endDate: now,
        breakdown
      },
      200
    ));

  } catch (error) {
    console.error("Get Vendor Earnings Breakdown Error:", error);
    return res.status(500).json(failureResponse(
      "Error fetching earnings breakdown",
      null,
      500
    ));
  }
};


// Get popular vehicles for a vendor
const getVendorPopularVehicles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const vendor_id = req.user?._id;
    if (!vendor_id) {
      return res.status(400).json(failureResponse("Vendor ID is required", null, 400));
    }

    const vendor = await Vendor.findOne({ user_id: vendor_id });    
    if (!vendor) {
      return res.status(400).json(failureResponse("Vendor not found", null, 400));
    }

    // Get all completed bookings for this vendor
    const bookings = await BookingModel.find({
      vendor_id: vendor._id,
      status: { $in: ["Confirmed", "Completed"] }
    })
    .populate({
      path: 'vehicle_id',
      populate: {
        path: 'vehicle_id',
        select: 'name'
      }
    })
    .lean();

    // Group bookings by vehicle and count occurrences
    const vehicleBookingCounts = bookings.reduce((acc: any, booking) => {
      const vehicleId = booking.vehicle_id._id.toString();
      acc[vehicleId] = acc[vehicleId] || {
        vehicle: booking.vehicle_id,
        bookingCount: 0,
        totalEarnings: 0
      };
      acc[vehicleId].bookingCount += 1;
      acc[vehicleId].totalEarnings += booking.total_price;
      return acc;
    }, {});

    // Convert to array and sort by booking count
    const popularVehicles = Object.values(vehicleBookingCounts)
      .sort((a: any, b: any) => b.bookingCount - a.bookingCount);

    return res.status(200).json(successResponse(
      "Popular vehicles fetched successfully",
      popularVehicles,
      200
    ));

  } catch (error) {
    console.error("Get Vendor Popular Vehicles Error:", error);
    return res.status(500).json(failureResponse(
      "Error fetching popular vehicles",
      null,
      500
    ));
  }
};

const getVendorBookingsBreakdown = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user_id = req?.user?._id;
    if (!user_id) {
      return res.status(400).json(failureResponse("User ID is required", null, 400));
    }

    // Get vendor details
    const vendor = await Vendor.findOne({ user_id: user_id });
    if (!vendor) {
      return res.status(400).json(failureResponse("Vendor not found", null, 400));
    }

    // Get upcoming bookings (status: Accepted)
    const upcomingBookings = await BookingModel.countDocuments({
      vendor_id: vendor._id,
      status: "Accepted", 
      start_date: { $gte: new Date() }
    });



    const response = {
      upcoming_bookings: upcomingBookings,
    };

    return res.status(200).json(successResponse(
      "Vendor bookings breakdown fetched successfully",
      response,
      200
    ));

  } catch (error) {
    console.error("Get Vendor Earnings Breakdown Error:", error);
    return res.status(500).json(failureResponse(
      "Error fetching vendor bookings breakdown",
      null,
      500
    ));
  }
};



export { getVendorEarnings, getVendorPopularVehicles, getVendorBookingsBreakdown };
