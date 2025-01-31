import express from 'express';
import { getVendorBookingsBreakdown, getVendorEarnings, getVendorEarningsBreakdown, getVendorPopularVehicles } from '../controllers/vendor_dashboard.controller';

const router = express.Router();

// Vendor dashboard routes
router.get('/earnings', getVendorEarnings);
router.get('/popular-vehicles', getVendorPopularVehicles);
router.get('/earnings-breakdown', getVendorEarningsBreakdown);
router.get('/bookings-breakdown', getVendorBookingsBreakdown);

export default router;
