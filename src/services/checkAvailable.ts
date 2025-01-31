import mongoose from "mongoose";
import Vehicle from '../models/vehicle.model'
import VendorVehicle from "../models/vendor_vehicle.model";
export const isVehicleAvailable = async (
  vehicleId: mongoose.Types.ObjectId,
  startDate: Date,
  endDate: Date
): Promise<boolean> => {
  const vehicle = await VendorVehicle.findById(vehicleId).populate({
    path: "bookings",
    match: { status: "Accepted" }, // Only consider accepted bookings for conflicts
    select: "start_date end_date", // Ensure these fields are selected
    model: "Booking" // Specify the model to populate
  });

  if (!vehicle || !vehicle.bookings) {
    return true; // If no bookings, the vehicle is available
  }

  // Check for overlapping bookings
  return vehicle.bookings.every((booking: any) => { // Use 'any' to bypass TypeScript error
    const bookingStart = booking.start_date;
    const bookingEnd = booking.end_date;

    // Check if the requested period does not overlap with this booking
    return endDate <= bookingStart || startDate >= bookingEnd;
  });
};
