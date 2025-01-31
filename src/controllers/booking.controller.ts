import { Response } from "express";
import Joi from "joi";
import Vehicle from "../models/vehicle.model";
import Vendor from "../models/vendor.model";
import { AuthenticatedRequest } from "../types/auth";
import { successResponse, failureResponse } from "../utils/response";
import mongoose from "mongoose";
import { isVehicleAvailable } from "../services/checkAvailable";
import BookingModel from "../models/booking.model";
import VendorVehicle from "../models/vendor_vehicle.model";
import { sendPushNotification } from "../services/firebase_service";
import notificationTokenModel from "../models/notificationToken.model";
import userModel from "../models/user.model";
import vendorModel from "../models/vendor.model";
import Payment from "../models/payment.model";
import { initiateOTPlessAuth, verifyOTP } from "../services/otp-less-auth";
import { notifyCustomer, notifyVendor } from '../utils/socket';
import addressModel from "../models/address.model";

const createBooking = async (req: AuthenticatedRequest, res: Response) => {
  console.log("createBooking");

  if (req.user?.user_type !== "customer") {
    return res
      .status(403)
      .json(failureResponse("Only customers can create bookings.", null, 403));
  }

  const schema = Joi.object({
    vehicle_id: Joi.string().required(),
    start_date: Joi.date().required(),
    start_time: Joi.string().required(),
    duration: Joi.string().required(),
    delivery: Joi.boolean().required(),
    customer_id: Joi.string().required(),
    vendor_id: Joi.string().required(),
    payment_type: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);
  console.log('validation error', error);
  // console.log("validate error", error);
  if (error)
    return res.status(400).json(failureResponse(error.details[0].message));

  const { vehicle_id, start_date, duration, start_time, delivery  , payment_type} = value;
  // console.log("vehicle_id", vehicle_id);

  const isVehicleAvailable = async (
    vehicleId: mongoose.Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<boolean> => {
    const vehicle = await VendorVehicle.findById({ _id: vehicleId }).populate({
      path: "bookings",
      match: { status: "Accepted" }, // Only consider accepted bookings for conflicts
      select: "start_date end_date", // Ensure these fields are selected
      model: "Booking", // Specify the model to populate
    });

    if (!vehicle || !vehicle.bookings) {
      return true; // If no bookings, the vehicle is available
    }

    // Check for overlapping bookings
    return vehicle.bookings.every((booking: any) => {
      // Use 'any' to bypass TypeScript error
      const bookingStart = booking.start_date;
      const bookingEnd = booking.end_date;

      // Check if the requested period does not overlap with this booking
      return endDate <= bookingStart || startDate >= bookingEnd;
    });
  };

  try {
    const vehicle = await VendorVehicle.findById({ _id: vehicle_id });
    console.log("vehicle", vehicle);
    if (!vehicle)
      return res
        .status(404)
        .json(failureResponse("Vehicle not found.", null, 404));
    // console.log("vehicle not found");

    if (vehicle.availability_status !== "Available") {
      console.log(vehicle.availability_status);
      return res
        .status(400)
        .json(failureResponse("Vehicle is not available for booking."));
      console.log("vehicle is not available");
    }

    // Calculate total price
    const start = new Date(start_date);
    let end = new Date(start); // Initialize end date based on start date

    // Calculate end date based on duration
    if (duration === "1 day") {
      end.setDate(start.getDate() + 1);
    } else if (duration === "2 day") {
      end.setDate(start.getDate() + 2);
    } else if (duration === "3 day") {
      end.setDate(start.getDate() + 3);
    } else if (duration === "4 day") {
      end.setDate(start.getDate() + 4);
    } else if (duration === "5 day") {
      end.setDate(start.getDate() + 5);
    } else if (duration === "6 day") {
      end.setDate(start.getDate() + 6);
    } else if (duration === "1 week") {
      end.setDate(start.getDate() + 7);
    } else if (duration === "2 week") {
      end.setDate(start.getDate() + 14);
    } else if (duration === "3 week") {
      end.setDate(start.getDate() + 21);
    } else if (duration === "1 month") {
      end.setMonth(start.getMonth() + 1);
    } else if (duration === "2 month") {
      end.setMonth(start.getMonth() + 2);
    } else if (duration === "3 month") {
      end.setMonth(start.getMonth() + 3);
    } else {
      return res
        .status(400)
        .json(failureResponse("Invalid duration specified."));
    }
    
    // const starttime = new Date(start_date);
    // const timeParts = start_time.split(":");
    // starttime.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0); // Set seconds to 0 to avoid invalid time
    // const formattedStartTime = starttime.toTimeString().split(" ")[0]; // Extracts only the time part
    // const durationInHours = (end.getTime() - starttime.getTime()) / (1000 * 60 * 60);
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const total_price = days * vehicle.daily_rate + (delivery ? vehicle.delivery_fee : 0);

    // Calculate partial payment (20% of total price)
    const partial_payment = total_price * 0.2;
    // if (durationInHours < 12) {
    //   return res.status(400).json(failureResponse("Minimum booking time is 12 hours."));
    // }

    // console.log(start_date, end);

    const available = await isVehicleAvailable(vehicle_id, start_date, end);
    if (!available) {
      console.log("Vehicle is not available for the requested period.");
    } else {
      console.log("Vehicle is available.");
    }

 

    if (available) {
      // Create booking if no conflicts
      const booking = new BookingModel({
        customer_id: req.user._id,
        vehicle_id: vehicle._id,
        vendor_id: vehicle.vendor_id,
        start_date: start_date,
        end_date: end,
        start_time: start_time,
        duration: duration,
        status: "Pending",
        delivery: delivery,
        total_price,
        partial_payment,
        payment_type,
      });
      await booking.save();
      console.log('booking save' , booking);
      vehicle.bookings?.push(booking._id as mongoose.Types.ObjectId);
      await vehicle.save();




      
     
      // First timeout for acceptance (30 seconds)
      setTimeout(async () => {
        const vendorUser = await vendorModel.findOne({_id: booking?.vendor_id._id});
        console.log("vendorUser", vendorUser);
  
            const vendorToken = await notificationTokenModel.findOne({ 
              user_id: vendorUser?.user_id 
            });
            const userToken = await notificationTokenModel.findOne({ 
              user_id: booking.customer_id 
            });
            if (vendorToken) {
              await sendPushNotification(
                vendorToken.token,
                "Booking Cancelled",
                "A booking was cancelled due to no response."
              );
            }
            if (userToken) {
              await sendPushNotification(
                userToken.token,
                "Booking Cancelled",
                "A booking was cancelled due to no response."
              );
            }
  
        const bookingStatus = await BookingModel.findById(booking._id);
        if (bookingStatus?.status === "Pending") {
          // Cancel if not accepted within 30 seconds
          bookingStatus.status = "Cancelled";
          await bookingStatus.save();

          // Send cancellation notifications
          const customerToken = await notificationTokenModel.findOne({ 
            user_id: booking.customer_id 
          });
          if (customerToken) {
            await sendPushNotification(
              customerToken.token,
              "Booking Cancelled",
              "Your booking was cancelled due to no response from the vendor."
            );
          }
         

          console.log(`Booking ${booking._id} cancelled due to no vendor response`);
        }
      }, 60000); // 30 seconds for acceptance

      // Separate timeout for completion (starts immediately)
      setTimeout(async () => {
        const bookingStatus = await BookingModel.findById(booking._id);
        if (bookingStatus?.status === "Accepted") {
          // Auto-complete the booking after 30 seconds
          bookingStatus.status = "Cancelled";
          await bookingStatus.save();

          // Send completion notifications
          const customerToken = await notificationTokenModel.findOne({ 
            user_id: booking.customer_id 
          });
          if (customerToken) {
            await sendPushNotification(
              customerToken.token,
              "Booking Cancelled ",
              "Your booking has been automatically marked as cancelled."
            );
          }
          const vendorUser = await vendorModel.findOne({_id: populatedBooking?.vendor_id._id});
      console.log("vendorUser", vendorUser);

          const vendorToken = await notificationTokenModel.findOne({ 
            user_id: vendorUser?.user_id 
          });
          const userToken = await notificationTokenModel.findOne({ 
            user_id: booking.customer_id 
          });
          console.log("vendorToken", vendorToken);
          if (vendorToken) {
            await sendPushNotification(
              vendorToken.token,
              "Booking Cancelled ",
              "A booking has been automatically marked as cancelled."
            );
          }
          if (userToken) {
            await sendPushNotification(
              userToken.token,
              "Booking Cancelled ",
              "A booking has been automatically marked as cancelled."
            );
          }

          // Update vehicle availability
          const vehicle = await VendorVehicle.findById(booking.vehicle_id);
          if (vehicle) {
            vehicle.availability_status = "Available";
            await vehicle.save();
          }

          console.log(`Booking ${booking._id} automatically completed`);
        } else if (bookingStatus?.status === "Pending") {
          // If still pending after 30 seconds, cancel it
          bookingStatus.status = "Cancelled";
          await bookingStatus.save();

          // Send cancellation notifications
          const customerToken = await notificationTokenModel.findOne({ 
            user_id: booking.customer_id 
          });
      notifyCustomer(booking.customer_id.toString(), booking);

          if (customerToken) {
            await sendPushNotification(
              customerToken.token,
              "Booking Cancelled",
              "Your booking was cancelled as it was not completed in time."
            );
          }

          console.log(`Booking ${booking._id} cancelled due to no completion`);
        }
      }, 600000); // 60 seconds total (30 for acceptance + 30 for completion)

      // Move the population logic inside the block where booking is defined
      const populatedBooking = await BookingModel.findById(booking._id)
        .select("start_date end_date start_time duration status delivery total_price ")
        .populate({
          path: "vehicle_id",
          select: "vehicle_number color images",
          populate: {
            path: "vehicle_id",
            select: "name variant year",
            populate: {
              path: "make",
              select: "name"
            }
          }
        })
        .populate("customer_id", "name email phone")
        .populate("vendor_id", "user_id business_name business_address")
        .exec();


      // Emit booking data via socket
      await notifyVendor(booking.vendor_id.toString(), {
        type: 'new_booking',
        data: populatedBooking
      });

      // Get customer and vendor FCM tokens
      const customerToken = await notificationTokenModel.findOne({
        user_id: populatedBooking?.customer_id._id,
      });
      const vendorUser = await vendorModel.findOne({_id: populatedBooking?.vendor_id._id});
      console.log("vendorUser", vendorUser);
      const vendorToken = await notificationTokenModel.findOne({
        user_id: vendorUser?.user_id,
      });
      console.log("customerToken", customerToken);
      console.log("vendorToken", vendorToken);

      // Send notifications if tokens exist
      if (customerToken) {
        console.log("customerToken", customerToken);
        await sendPushNotification(
          customerToken.token,
          "Booking Request",
          "Your booking request has been created successfully."
        );
      }

      if (vendorToken) {
        console.log("vendorToken", vendorToken);
        await sendPushNotification(
          vendorToken.token,
          "New Booking Request",
          "You have received a new booking request."
        );
      }

      res
        .status(201)
        .json(
          successResponse(
            "Booking request created successfully.",
            { booking: populatedBooking },
            201
          )
        );
      // console.log("booking request created successfully", populatedBooking);
    }
  } catch (err) {
    console.error("Create Booking Error:", err);
    console.log(err);
    res.status(500).json(failureResponse("Internal server error.", null, 500));
  }
};
const getUserBookings = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user)
    return res.status(404).json(failureResponse("User not found.", null, 404));

  try {
    let bookings;

    if (user.user_type === "customer") {
      bookings = await BookingModel.find({ customer_id: user._id })
        .populate({
          path: "vehicle_id",
          select: "vehicle_id images color ",
          populate: {
            path: "vehicle_id",
            select: "name make year variant",
            populate: {
              path: "make",
              select: "name",
            },
          },
        })
        .populate({
          path: "vendor_id",
          select: "business_name business_address alternate_phone user_id pickup_location",
          populate: {
            path: "user_id",
            select: "phone"
          }
        });
    } else if (user.user_type === "Vendor") {
      const vendor = await Vendor.findOne({ user_id: user._id });
      if (!vendor)
        return res
          .status(404)
          .json(failureResponse("Vendor profile not found.", null, 404));
      bookings = await BookingModel.find({ vendor_id: vendor._id })
        .populate({
          path: "vehicle_id",
          populate: {
            path: "vehicle_id",
            populate: {
              path: "make",
            },
          },
        })
        .populate("customer_id", "name email phone");
    } else {
      // Admin can view all bookings
      bookings = await BookingModel.find()
        .populate({
          path: "vehicle_id",
          populate: {
            path: "vehicle_id",
            populate: {
              path: "make",
            },
          },
        })
        .populate("vendor_id", "business_name")
        .populate("customer_id", "name email phone");
    }

    res
      .status(200)
      .json(successResponse("Bookings retrieved successfully.", { bookings }));
  } catch (err) {
    console.error("Get User Bookings Error:", err);
    res.status(500).json(failureResponse("Internal server error.", null, 500));
  }
};

const updateBookingStatusCustomer = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  console.log("updateBookingStatusCustomer");
  const id = req.user?._id;
  // const {booking_id} = req.params;
  // const {payment_id , payment_method , payment_status} = req.body;

  const {status  , payment_id , booking_id} = req.body;
  console.log("status", status);
  console.log("payment_id", payment_id);
  console.log("booking_id", booking_id);
  try {
    
  const booking = await BookingModel.findById({_id: booking_id});
  if (!booking) {
    console.log("booking not found");
    return res.status(404).json(failureResponse("Booking not found"));
  }
  if (booking.customer_id.toString() !== id!.toString()) {
    console.log("You are not authorized to update this booking");
    return res.status(403).json(failureResponse("You are not authorized to update this booking"));
  }
  const payment = await Payment.findOne({booking_id: booking._id , payment_id: payment_id ,});
  if (!payment) {
    console.log("Payment not found");
    return res.status(404).json(failureResponse("Payment not found"));
  }
  if (payment.payment_status !== "Completed") {
    console.log("Payment is not completed");
    return res.status(400).json(failureResponse("Payment is not completed"));
  }

  
  booking.status = status;
  await booking.save();

  return res.status(200).json(successResponse("Booking status updated successfully"));

    
  } catch (error) {
    console.error("Error updating booking status:", error);
    return res.status(500).json(failureResponse("Error updating booking status"));
  }


};

const updateBookingStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  console.log("updateBookingStatus");
  
  const { id } = req.params;
  const { status } = req.body;

  try {
    const booking = await BookingModel.findById(id);
    if (!booking) {
      console.log("booking not found");
      return res.status(404).json(failureResponse("Booking not found"));
    }

    // Only allow vendors to update booking status
    if (req.user?.user_type !== "vendor") {
      console.log("user is not a vendor");
      return res
        .status(403)
        .json(failureResponse("Only vendors can update booking status"));
    }

    // Verify the vendor owns this booking
    const vendor = await Vendor.findOne({ user_id: req.user?._id });
    if (!vendor || booking.vendor_id.toString() !== vendor._id.toString()) {
      console.log("vendor does not own this booking");
      return res
        .status(403)
        .json(failureResponse("Not authorized to update this booking"));
    }

    if (status === "Accepted" || status === "Rejected" || status === "Ongoing" || status === "Completed") {
      console.log("status is accepted or rejected");
      booking.status = status;
      await booking.save();

      notifyCustomer(booking.customer_id.toString(), booking);

      // // If accepted, update vehicle availability
      // if (status === "Accepted") {
      //   const vehicle = await VendorVehicle.findById(booking.vehicle_id);
      //   if (vehicle) {
      //     console.log("vehicle found");
      //     // vehicle.availability_status = "Booked";
      //     await vehicle.save();
      //     console.log("vehicle availability updated to Booked");
      //   }
      // }

      return res
        .status(200)
        .json(successResponse(`Booking ${status.toLowerCase()} successfully`));
    }

    return res.status(400).json(failureResponse("Invalid status update"));
  } catch (error) {
    console.error("Error updating booking status:", error);
    return res
      .status(500)
      .json(failureResponse("Error updating booking status"));
  }
};

const checkBookingAvailability = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  console.log("checkBookingAvailability");
  const { vehicle_id, start_date, duration } = req.body;
  let start = new Date(start_date);
  let end = new Date(start); // Initialize end date based on start date

  // Calculate end date based on duration
  if (duration === "1 day") {
    end.setDate(start.getDate() + 1);
  } else if (duration === "2 day") {
    end.setDate(start.getDate() + 2);
  } else if (duration === "3 day") {
    end.setDate(start.getDate() + 3);
  } else if (duration === "4 day") {
    end.setDate(start.getDate() + 4);
  } else if (duration === "5 day") {
    end.setDate(start.getDate() + 5);
  } else if (duration === "6 day") {
    end.setDate(start.getDate() + 6);
  } else if (duration === "1 week") {
    end.setDate(start.getDate() + 7);
  } else if (duration === "2 week") {
    end.setDate(start.getDate() + 14);
  } else if (duration === "3 week") {
    end.setDate(start.getDate() + 21);
  } else if (duration === "1 month") {
    end.setMonth(start.getMonth() + 1);
  } else if (duration === "2 month") {
    end.setMonth(start.getMonth() + 2);
  } else if (duration === "3 month") {
    end.setMonth(start.getMonth() + 3);
  } else {
    console.log("Invalid duration specified.");
    console.log("duration", duration);
    return res.status(400).json(failureResponse("Invalid duration specified."));
  }

  if (await isVehicleAvailable(vehicle_id, start, end)) {
    console.log("Vehicle is available for the requested period.");
    return res
      .status(200)
      .json(
        successResponse("Vehicle is available for the requested period.", {
          available: true,
        })
      );
  } else {
    console.log("Vehicle is not available for the requested period.");
    return res
      .status(200)
      .json(
        successResponse("Vehicle is not available for the requested period.", {
          available: false,
        })
      );
  }
};

const getVehicleBookingsDates = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { vehicle_id } = req.params;
  console.log(vehicle_id);

  const vehicle = await VendorVehicle.findById(vehicle_id).populate("bookings");
  if (!vehicle) {
    return res.status(404).json(failureResponse("Vehicle not found."));
  }
  const bookings = vehicle.bookings;
  return res
    .status(200)
    .json(
      successResponse("Vehicle bookings dates retrieved successfully.", {
        bookings,
      })
    );
};

const getVendorBookings = async (req: AuthenticatedRequest, res: Response) => {
  console.log("getVendorBookings");
  if (req.user?.user_type !== "vendor") {
    console.log("user is not a vendor");
    return res.status(400).json(failureResponse("User is not a vendor"));
  }
  // const {vendor_id} = req.params;
  // console.log('vendor_id', vendor_id)

  const vendor = await Vendor.findOne({ user_id: req.user?._id });
  if (!vendor) {
    console.log("vendor not found");
    return res.status(404).json(failureResponse("Vendor not found"));
  }

  const bookings = await BookingModel.find({ vendor_id: vendor._id })
    .sort({ created_at: -1 }) // Sort by created_at in descending order (newest first)
    .populate({
      path: "vehicle_id",
      populate: {
        path: "vehicle_id",
        select: "name",
      },
      select: "images",
    })
    .populate("customer_id", "name phone");
  console.log("bookings", bookings);
  return res
    .status(200)
    .json(successResponse("Vendor bookings retrieved successfully", bookings));
};


const getVendorBookingsDetails = async (req: AuthenticatedRequest, res: Response) => {
  console.log("getVendorBookingsDetails");
  const {booking_id} = req.params;
  if (req.user?.user_type !== "vendor") {
    console.log("user is not a vendor");
    return res.status(400).json(failureResponse("User is not a vendor"));
  }


  const bookings = await BookingModel.findOne({ _id: booking_id })
    .populate({
      path: "vehicle_id",
      populate: {
        path: "vehicle_id",
        select: "name",
      },
      select: "images",
    })
    .populate("customer_id", "name phone");

    if (!bookings) {
      return res.status(404).json(failureResponse("Booking not found"));
    }

    const address = await addressModel.findOne({user_id: bookings.customer_id});
  console.log("bookings", bookings);
  console.log("address", address);
  return res
    .status(200)
    .json(successResponse("Vendor bookings retrieved successfully", {bookings , address}));
};





const sendBookingToCustomer = async (req: AuthenticatedRequest, res: Response) => {
  console.log("sendBookingToCustomer");
 const user_id = req.user?._id;
 const {booking_id} = req.params; 
 console.log("booking_id", booking_id);
  if (!user_id) {
    console.log("user_id not found");
    return res.status(404).json(failureResponse("User not found"));
  }
  const user = await userModel.findOne({_id: user_id});
  if (!user) {
    console.log("user not found");
    return res.status(404).json(failureResponse("User not found"));
  }
  // const userToken = await notificationTokenModel.findOne({user_id: user._id});
  // if (!userToken) {
  //   return res.status(404).json(failureResponse("User token not found"));
  // }
  const booking = await BookingModel.findOne({_id: booking_id ,}).populate("vehicle_id" , "vendor_id");
  if (!booking) {
    console.log("booking not found");
    return res.status(404).json(failureResponse("Booking not found"));
  }
  // const userToken = await notificationTokenModel.findOne({user_id: booking.customer_id});
  // if (!userToken) {
  //   return res.status(404).json(failureResponse("User token not found"));
  // }

  res.status(200).json(successResponse("Booking found", booking));

} 

const sendOtpCustomer = async (req: AuthenticatedRequest, res: Response) => {
  const { booking_id } = req.body;
  
  // Populate the customer_id to access the phone property
  const booking = await BookingModel.findOne({ _id: booking_id }).populate('customer_id', 'phone');
  
  if (!booking) {
    return res.status(404).json(failureResponse("Booking not found"));
  }
  if (booking.status !== "Confirmed") {
    console.log("Booking is not completed");
    return res.status(400).json(failureResponse("Booking is not completed"));
  }
  if (req.user?.user_type !== "vendor") {
    console.log("User is not a vendor");
    return res.status(400).json(failureResponse("User is not a vendor"));
  }
  const vendor = await Vendor.findOne({ user_id: req.user?._id });
  if (!vendor) {
    console.log("Vendor not found");
    return res.status(404).json(failureResponse("Vendor not found"));
  }
  const customer = await userModel.findOne({ _id: booking.customer_id });
  if (!customer) {
    console.log("Customer not found");
    return res.status(404).json(failureResponse("Customer not found"));
  }

  try {
    const numberwith91 = `+91${customer.phone}`; // Access phone after populating
    console.log("numberwith91", numberwith91);
    const response = await initiateOTPlessAuth(numberwith91);
    
    if (!response.success) {
      return res.status(400).json(failureResponse(response.error || 'Authentication failed'));
    }

    console.log("response.data", response.data);
    return res.status(200).json(successResponse('Authentication initiated successfully', response.data));
  } catch (error) {
    console.error('OTPless initiation error:', error);
    return res.status(500).json(failureResponse('Failed to initiate authentication'));
  }
}

const validateOtpforBooking = async (req: AuthenticatedRequest, res: Response) => {
  const {booking_id , otp , requestId} = req.body;
  const booking = await BookingModel.findOne({_id: booking_id});
  if (!booking) {
    return res.status(404).json(failureResponse("Booking not found"));
  }
  const customer = await userModel.findOne({_id: booking.customer_id});
  if (!customer) {
    return res.status(404).json(failureResponse("Customer not found"));
  }
  try {
    const numberwith91 = `+91${customer.phone}`;

    const response = await verifyOTP(numberwith91, otp, requestId);
    
    if (!response.success) {
      return res.status(400).json(failureResponse(response.error || 'OTP verification failed'));
    }
    return res.status(200).json(successResponse('OTP verified successfully', {
     
    }));
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json(failureResponse('Failed to verify OTP'));
  }
 
}

const sendBookingToVendor = async (req: AuthenticatedRequest, res: Response) => {
  // console.log("running sendBookingToVendor");
  const user_id = req.user?._id;
  // console.log("vendor_id", user_id);

  if (!user_id) {
    // console.log("vendor id is required");
    return res.status(400).json(failureResponse("Vendor ID is required"));
  }

  const vendor = await Vendor.findOne({ user_id: user_id });
  if (!vendor) {
    // console.log("vendor not found");
    return res.status(404).json(failureResponse("Vendor not found"));
  }

  try {
    const pendingBookings = await BookingModel.find({
      vendor_id: vendor._id,
      status: "Pending",
    }).populate({
      path: "vehicle_id",
      populate: {
        path: "vehicle_id"
      }
    }).populate("customer_id");

    if (!pendingBookings || pendingBookings.length === 0) {
      // console.log("no pending bookings found for this vendor");
      return res
        .status(404)
        .json(failureResponse("No pending bookings found for this vendor."));
    }

    // console.log(pendingBookings);

    // Notify the vendor about the pending bookings
    console.log(
      `Notifying vendor: ${vendor.business_name} with ${pendingBookings.length} bookings`
    );

    // Set a timeout to cancel all pending bookings if not accepted within 5 minutes
    setTimeout(async () => {
      const stillPendingBookings = await BookingModel.find({
        vendor_id: vendor._id,
        status: "Pending",
      });

      for (const booking of stillPendingBookings) {
        booking.status = "Cancelled";
        await booking.save();

        // Update vehicle availability status back to "Available"
        const vehicle = await VendorVehicle.findById(booking.vehicle_id);
        if (vehicle) {
          vehicle.availability_status = "Available";
          await vehicle.save();
        }

        console.log(
          `Booking ${booking._id} canceled due to vendor's lack of response.`
        );
      }
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    console.log("pendingBookings", pendingBookings);

    return res
      .status(200)
      .json(
        successResponse(
          "Pending bookings sent to vendor. Waiting for their response.",
          { bookings: pendingBookings }
        )
      );
  } catch (error) {
    console.error("Error in sendBookingToVendor:", error);
    return res.status(500).json(failureResponse("Internal server error."));
  }
};

export {
  createBooking,
  getUserBookings,
  updateBookingStatusCustomer,
  sendBookingToCustomer,
  sendOtpCustomer,
  validateOtpforBooking,
  updateBookingStatus,
  checkBookingAvailability,
  getVehicleBookingsDates,
  getVendorBookings,
  sendBookingToVendor,
  getVendorBookingsDetails,
};

