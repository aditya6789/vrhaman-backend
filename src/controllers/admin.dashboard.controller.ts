import { Request, Response } from 'express';
import BookingModel from '../models/booking.model';
import UserModel from '../models/user.model';
import VendorModel from '../models/vendor.model';
import VendorVehicle from '../models/vendor_vehicle.model';
import VehicleModel from '../models/vehicle.model';
import Payment from '../models/payment.model';
import { successResponse, failureResponse } from '../utils/response';
import { AuthenticatedRequest } from '../types/auth';

// Get all bookings
const getAllBookings = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const userType = req.user?.user_type;

    if (!userId) {
        console.log('unauthorized admin');
        return res.status(401).json(failureResponse("Unauthorized"));
    }
    if (userType !== 'admin') {
        console.log('unauthorized admin 2');
        return res.status(401).json(failureResponse("Unauthorized Only Admin can access this route"));
    }

  try {
    const bookings = await BookingModel.find()
      .populate('vehicle_id', 'vehicle_number vehicle_type ')
      .populate('vehicle_id', 'name')
      .populate('customer_id', 'name email')
      .populate('vendor_id', 'business_name')
      .sort({ createdAt: -1 }) // Sort by most recent first
      .limit(10); // Limit to 10 bookings
    return res.status(200).json(successResponse("Recent bookings retrieved successfully", bookings));
  } catch (error) {
    console.error("Error fetching recent bookings:", error);
    return res.status(500).json(failureResponse("Error fetching recent bookings"));
  }
};

// Get all users
const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const userType = req.user?.user_type;
    if (!userId) {
        console.log('unauthorized admin 3');
        return res.status(401).json(failureResponse("Unauthorized"));
    }
    if (userType !== 'admin') {
        console.log('unauthorized admin 4');
        return res.status(401).json(failureResponse("Unauthorized Only Admin can access this route"));
    }
  try {
    const users = await UserModel.find({user_type: 'Customer'})
      .select('name email user_type is_active')
      .sort({ createdAt: -1 }) // Sort by most recent first
      .limit(10); // Limit to 10 users
    return res.status(200).json(successResponse("Recent users retrieved successfully", users));
  } catch (error) {
    console.error("Error fetching recent users:", error);
    return res.status(500).json(failureResponse("Error fetching recent users"));
  }
};

// Get all vendors
const getAllVendors = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const userType = req.user?.user_type;
    if (!userId) {
        console.log('unauthorized admin 5');
        return res.status(401).json(failureResponse("Unauthorized"));
    }
    if (userType !== 'admin') {
        console.log('unauthorized admin 6');
        return res.status(401).json(failureResponse("Unauthorized Only Admin can access this route"));
    }
    try {
        const vendors = await VendorModel.find()
            .populate('user_id', 'name phone')
            .select('business_name user_id');
        return res.status(200).json(successResponse("All vendors retrieved successfully", vendors));
    } catch (error) {
        console.error("Error fetching all vendors:", error);
        return res.status(500).json(failureResponse("Error fetching all vendors"));
    }
}

// Get vendor count
const getVendorCount = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const userType = req.user?.user_type;
    if (!userId) {
        console.log('unauthorized admin 7');
        return res.status(401).json(failureResponse("Unauthorized"));
    }
    if (userType !== 'admin') {
        console.log('unauthorized admin 8');
        console.log(userId);
        return res.status(401).json(failureResponse("Unauthorized Only Admin can access this route"));
    }
  try {
    const count = await VendorModel.countDocuments();
    return res.status(200).json(successResponse("Vendor count retrieved successfully", { count }));
  } catch (error) {
    console.error("Error fetching vendor count:", error);
    return res.status(500).json(failureResponse("Error fetching vendor count"));
  }
};

// Get user count
const getUserCount = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const userType = req.user?.user_type;
    if (!userId) {
        console.log('unauthorized admin 9');
        return res.status(401).json(failureResponse("Unauthorized"));
    }
    if (userType !== 'admin') {
        console.log('unauthorized admin 10');
        console.log(userId);
        return res.status(401).json(failureResponse("Unauthorized Only Admin can access this route"));
    }
  try {
    const count = await UserModel.countDocuments();
    return res.status(200).json(successResponse("User count retrieved successfully", { count }));
  } catch (error) {
    console.error("Error fetching user count:", error);
    return res.status(500).json(failureResponse("Error fetching user count"));
  }
};

// Get booking count
const getBookingCount = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const userType = req.user?.user_type;
    if (!userId) {
        console.log('unauthorized admin 11');
        return res.status(401).json(failureResponse("Unauthorized"));
    }
    if (userType !== 'admin') {
        console.log('unauthorized admin 12');
        console.log(userId);
        return res.status(401).json(failureResponse("Unauthorized Only Admin can access this route"));
    }
  try {
    const count = await BookingModel.countDocuments();
    return res.status(200).json(successResponse("Booking count retrieved successfully", { count }));
  } catch (error) {
    console.error("Error fetching booking count:", error);
    return res.status(500).json(failureResponse("Error fetching booking count"));
  }
};

// Get vehicle count
const getVehicleCount = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const userType = req.user?.user_type;
    if (!userId) {
        console.log('unauthorized admin 13');
        return res.status(401).json(failureResponse("Unauthorized"));
    }
    if (userType !== 'admin') {
        console.log('unauthorized admin 14');
        console.log(userId);
        return res.status(401).json(failureResponse("Unauthorized Only Admin can access this route"));
    }
  try {
    const count = await VehicleModel.countDocuments();
    return res.status(200).json(successResponse("Vehicle count retrieved successfully", { count }));
  } catch (error) {
    console.error("Error fetching vehicle count:", error);
    return res.status(500).json(failureResponse("Error fetching vehicle count"));
  }
};

// Get booking statistics
const getBookingStatistics = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const userType = req.user?.user_type;
    if (!userId) {
        console.log('unauthorized admin 15');
        return res.status(401).json(failureResponse("Unauthorized"));
    }
    if (userType !== 'admin') {
        console.log('unauthorized admin 16');
        return res.status(401).json(failureResponse("Unauthorized Only Admin can access this route"));
    }
  try {
    const totalBookings = await BookingModel.countDocuments();
    const completedBookings = await BookingModel.countDocuments({ status: 'Completed' });
    const pendingBookings = await BookingModel.countDocuments({ status: 'Pending' });

    const statistics = {
      totalBookings,
      completedBookings,
      pendingBookings
    };

    return res.status(200).json(successResponse("Booking statistics retrieved successfully", statistics));
  } catch (error) {
    console.error("Error fetching booking statistics:", error);
    return res.status(500).json(failureResponse("Error fetching booking statistics"));
  }
};

// Update user status
const updateUserStatus = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const userType = req.user?.user_type;
    if (!userId) {
        console.log('unauthorized admin 17');
        return res.status(401).json(failureResponse("Unauthorized"));
    }
    if (userType !== 'admin') {
        console.log('unauthorized admin 18');
        return res.status(401).json(failureResponse("Unauthorized Only Admin can access this route"));
    }
//   const { userId } = req.params;
  const { isActive } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json(failureResponse("User not found"));
    }

    user.is_active = isActive;
    await user.save();

    return res.status(200).json(successResponse("User status updated successfully"));
  } catch (error) {
    console.error("Error updating user status:", error);
    return res.status(500).json(failureResponse("Error updating user status"));
  }

  
};
const getAllBookingsData = async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.user_type !== "admin") {
    return res.status(400).json(failureResponse("User is not an admin"));
  }
  try {
    const bookings = await BookingModel.find()
      .populate({
        path: 'vendor_id',
        populate: {
          path: 'user_id',
          select: 'phone'
        },
        select: 'business_name user_id'
      })
      .populate('vehicle_id')
      .populate('customer_id', 'name email phone')
      .sort({ created_at: -1 });
    return res.status(200).json(successResponse("Bookings retrieved successfully", bookings));
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json(failureResponse("Error fetching bookings"));
  }
};

// Get dashboard stats overview
const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const timeRange = req.query.timeRange || '30days';
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get current period stats
    const [
      totalUsers,
      totalVendors,
      totalVehicles,
      totalRevenue,
      activeBookings,
      completedBookings
    ] = await Promise.all([
      UserModel.countDocuments({ created_at: { $gte: startDate } }),
      VendorModel.countDocuments({ created_at: { $gte: startDate } }),
      VehicleModel.countDocuments({ created_at: { $gte: startDate } }),
      Payment.aggregate([
        { $match: { created_at: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      BookingModel.countDocuments({ 
        status: "Accepted",
        created_at: { $gte: startDate }
      }),
      BookingModel.countDocuments({ 
        status: "Completed",
        created_at: { $gte: startDate }
      })
    ]);

    // Calculate trends (percentage change from previous period)
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(startDate.getDate() - (now.getDate() - startDate.getDate()));

    const [
      previousUsers,
      previousVendors,
      previousVehicles,
      previousRevenue
    ] = await Promise.all([
      UserModel.countDocuments({ 
        created_at: { 
          $gte: previousStartDate,
          $lt: startDate 
        } 
      }),
      VendorModel.countDocuments({ 
        created_at: { 
          $gte: previousStartDate,
          $lt: startDate 
        } 
      }),
      VehicleModel.countDocuments({ 
        created_at: { 
          $gte: previousStartDate,
          $lt: startDate 
        } 
      }),
      Payment.aggregate([
        { 
          $match: { 
            created_at: { 
              $gte: previousStartDate,
              $lt: startDate 
            } 
          } 
        },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    const calculateTrend = (current: number, previous: number) => 
      previous === 0 ? 100 : ((current - previous) / previous) * 100;

    const response = {
      overview: {
        totalUsers,
        totalVendors,
        totalVehicles,
        totalRevenue: totalRevenue[0]?.total || 0,
        activeBookings,
        completedBookings,
        trends: {
          users: calculateTrend(totalUsers, previousUsers),
          vendors: calculateTrend(totalVendors, previousVendors),
          vehicles: calculateTrend(totalVehicles, previousVehicles),
          revenue: calculateTrend(
            totalRevenue[0]?.total || 0,
            previousRevenue[0]?.total || 0
          )
        }
      },
      timeRange,
      lastUpdated: new Date().toISOString()
    };

    return res.status(200).json(successResponse("Dashboard stats retrieved successfully", response));
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json(failureResponse("Error fetching dashboard stats"));
  }
};

// Get revenue analytics
const getRevenueAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get monthly revenue data
    const monthlyData = await Payment.aggregate([
      {
        $match: {
          payment_status: 'Completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$amount" },
          bookings: { $sum: 1 },
          startDate: { $min: "$createdAt" },
          endDate: { $max: "$createdAt" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      },
      {
        $project: {
          _id: 0,
          month: {
            $let: {
              vars: {
                monthsInString: [
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ]
              },
              in: { 
                $arrayElemAt: ["$$monthsInString", { $subtract: ["$_id.month", 1] }] 
              }
            }
          },
          year: "$_id.year",
          revenue: { $ifNull: ["$revenue", 0] },
          bookings: { $ifNull: ["$bookings", 0] },
          startDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$startDate" }
          },
          endDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$endDate" }
          }
        }
      }
    ]);

    // Get weekly revenue data
    const weeklyData = await Payment.aggregate([
      {
        $match: {
          payment_status: 'Completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" }
          },
          revenue: { $sum: "$amount" },
          bookings: { $sum: 1 },
          startDate: { $min: "$createdAt" },
          endDate: { $max: "$createdAt" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.week": 1 }
      },
      {
        $project: {
          _id: 0,
          weekNumber: "$_id.week",
          year: "$_id.year",
          revenue: { $ifNull: ["$revenue", 0] },
          bookings: { $ifNull: ["$bookings", 0] },
          startDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$startDate" }
          },
          endDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$endDate" }
          }
        }
      }
    ]);

    // Get daily revenue for current week
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const dailyData = await Payment.aggregate([
      {
        $match: {
          payment_status: 'Completed',
          createdAt: {
            $gte: startOfWeek,
            $lte: endOfWeek
          }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          revenue: { $sum: "$amount" },
          bookings: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          revenue: { $ifNull: ["$revenue", 0] },
          bookings: { $ifNull: ["$bookings", 0] }
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Fill in missing dates for current week
    const allDates = [];
    let currentDate = new Date(startOfWeek);
    while (currentDate <= endOfWeek) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existingData = dailyData.find(d => d.date === dateStr) || {
        date: dateStr,
        revenue: 0,
        bookings: 0
      };
      allDates.push(existingData);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get payment method distribution
    const paymentMethodData = await Payment.aggregate([
      {
        $match: {
          payment_status: 'Completed'
        }
      },
      {
        $group: {
          _id: { $ifNull: ["$payment_method", "Other"] },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          method: { $ifNull: ["$_id", "Other"] },
          revenue: { $ifNull: ["$revenue", 0] },
          count: { $ifNull: ["$count", 0] },
          percentage: {
            $multiply: [
              { $divide: ["$count", { $sum: "$count" }] },
              100
            ]
          }
        }
      }
    ]);

    return res.status(200).json(successResponse("Revenue analytics retrieved successfully", {
      monthlyData,
      weeklyData,
      dailyData: allDates,
      paymentMethodData
    }));

  } catch (error) {
    console.error("Error fetching revenue analytics:", error);
    return res.status(500).json(failureResponse("Error fetching revenue analytics"));
  }
};

// Get booking status analytics
const getBookingStatusAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const total = await BookingModel.countDocuments();
    const statusDistribution = await BookingModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const response = {
      statusDistribution: statusDistribution.map(item => ({
        status: item._id,
        count: item.count,
        percentage: (item.count / total) * 100
      })),
      total
    };

    return res.status(200).json(successResponse("Booking status analytics retrieved successfully", response));
  } catch (error) {
    console.error("Error fetching booking status analytics:", error);
    return res.status(500).json(failureResponse("Error fetching booking status analytics"));
  }
};

// Get top performing vehicles
const getTopVehicles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const topVehicles = await VendorVehicle.aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "vehicle_id",
          as: "bookings"
        }
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicle_id",
          foreignField: "_id",
          as: "vehicleDetails"
        }
      },
      {
        $unwind: "$vehicleDetails"
      },
      {
        $project: {
          vehicleName: "$vehicleDetails.name",
       
          bookings: { $size: "$bookings" },
          revenue: {
            $sum: "$bookings.total_price"
          },
          rating: { $avg: "$bookings.rating" },
          vehicleNumber: "$vehicle_number",
          imageUrl: { $arrayElemAt: ["$images", 0] }
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: limit }
    ]);

    return res.status(200).json(successResponse("Top vehicles retrieved successfully", {
      vehicles: topVehicles
    }));
  } catch (error) {
    console.error("Error fetching top vehicles:", error);
    return res.status(500).json(failureResponse("Error fetching top vehicles"));
  }
};

export {
  getAllBookings,
  getAllUsers,
  getAllVendors,
  getVendorCount,
  getUserCount,
  getAllBookingsData,
  getBookingCount,
  getVehicleCount,
  getBookingStatistics,
  updateUserStatus,
  getDashboardStats,
  getRevenueAnalytics,
  getBookingStatusAnalytics,
  getTopVehicles
};
