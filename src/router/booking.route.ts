import { Router } from "express";
import {
  createBooking,
  getUserBookings,
  updateBookingStatus,
  checkBookingAvailability,
  getVehicleBookingsDates,
  getVendorBookings,
  sendBookingToVendor,
  updateBookingStatusCustomer,
  sendBookingToCustomer,
  validateOtpforBooking,
  sendOtpCustomer,
  getVendorBookingsDetails,
} from "../controllers/booking.controller";

const router = Router();

router.post("/", createBooking);
router.get("/", getUserBookings);
router.get("/send-booking", sendBookingToVendor);
router.patch("/customer/", updateBookingStatusCustomer);
router.patch("/:id", updateBookingStatus);
router.get("/customer/send-booking/:booking_id", sendBookingToCustomer);
router.post("/check-availability", checkBookingAvailability);
router.get("/vehicle-bookings-dates/:vehicle_id", getVehicleBookingsDates);

// vendor bookings
router.get("/vendor", getVendorBookings);
router.get("/vendor/:booking_id", getVendorBookingsDetails);
router.post("/send-otp-for-booking", sendOtpCustomer);
router.post("/validate-otp-for-booking", validateOtpforBooking);
export default router;
