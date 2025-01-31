import { Router } from 'express';
import {
  getAllBookings,
  getAllUsers,
  getAllVendors,
  getVendorCount,
  getUserCount,
  getBookingCount,
  getVehicleCount,
  updateUserStatus,
  getAllBookingsData,
  getDashboardStats,
  getRevenueAnalytics,
  getBookingStatusAnalytics,
  getTopVehicles
} from '../controllers/admin.dashboard.controller';
import upload from '../services/multer';

const router = Router();

// Route to get all bookings
router.get('/bookings', getAllBookings);

// Route to get all users
router.get('/users', getAllUsers);

// Route to get all vendors
router.get('/vendors', getAllVendors);

// Route to get vendor count
router.get('/vendors/count', getVendorCount);

// Route to get user count
router.get('/users/count', getUserCount);

// Route to get booking count
router.get('/bookings/count', getBookingCount);

// Route to get vehicle count
router.get('/vehicles/count', getVehicleCount);

// Route to update user status
router.put('/users/:userId/status', updateUserStatus);

// Route to get all bookings data
router.get('/bookings/data', getAllBookingsData);

// New dashboard analytics routes
router.get('/stats', getDashboardStats);
router.get('/revenue', getRevenueAnalytics);
router.get('/bookings/status', getBookingStatusAnalytics);
router.get('/vehicles/top', getTopVehicles);



router.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File not uploaded" });
    }

    res.json({
      message: "Upload successful",
      fileUrl: (req.file as any).location, // S3 file URL
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
});



export default router; 