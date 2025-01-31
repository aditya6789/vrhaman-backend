import { Request, Response } from "express";
import Payment from "../models/payment.model";
import { AuthenticatedRequest } from "../types/auth";
import User from "../models/user.model";
import { successResponse, failureResponse } from "../utils/response";
import Wallet from '../models/wallet.model';
import BookingModel from '../models/booking.model';
import vendorModel from "../models/vendor.model";

// Interface for Payment creation request body
interface CreatePaymentRequest {
  amount: number;
  payment_id: string;
  booking_id: string;
  status: "Pending" | "Completed" | "Failed";
}

// Interface for Payment status update request body
interface UpdatePaymentStatusRequest {
  transactionId: string;
  rideId: String;
  status: "Pending" | "Completed" | "Failed";
}

const PLATFORM_FEE_PERCENTAGE = 5; // 5% platform fee

const PaymentController = {

  // Create a new payment
  async createPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    console.log("createPayment");
    try {
      const { amount, payment_id, booking_id , status }: CreatePaymentRequest = req.body;


      // Create a new payment with status 'Pending'
      const newPayment = new Payment({
        amount,
        payment_id,
        booking_id,
        payment_status: status,
      });
      console.log("newPayment", newPayment);

    

      const savedPayment = await newPayment.save();
      console.log("savedPayment", savedPayment);
      res.status(201).json(savedPayment);
    } catch (error) {
      res.status(500).json(failureResponse("Error creating payment : " + error?.toString()));
    } 
  },

  // Get payment details by transactionId
  async getPayment(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      const payment = await Payment.findOne({ booking_id: transactionId });

      if (!payment) {
        res.status(404).json(failureResponse("Payment not found"));
        return;
      }

      res.status(200).json(successResponse("Payment retrieved successfully", payment));
    } catch (error) {
      res.status(500).json(failureResponse("Error retrieving payment : " + error?.toString()));
    }
  },

  // Handle payment success
  async handlePaymentSuccess(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { booking_id, payment_id, amount } = req.body;

      // Verify the payment and create payment record
      const payment = new Payment({
        booking_id,
        payment_id,
        amount,
        payment_status: "Completed"
      });
      await payment.save();

      // Get booking details
      const booking = await BookingModel.findById(booking_id);
      if (!booking) {
         res.status(404).json(failureResponse("Booking not found"));
      }

      // Calculate platform fee and vendor amount
      const platformFee = (amount * PLATFORM_FEE_PERCENTAGE) / 100;
      const vendorAmount = amount - platformFee;

      // Find or create vendor wallet
      let wallet = await Wallet.findOne({ vendor_id: booking!.vendor_id });
      if (!wallet) {
        wallet = new Wallet({
          vendor_id: booking!.vendor_id,
          balance: 0
        });
      }

      // Add transaction to wallet
      wallet.transactions.push({
        booking_id,
        amount: vendorAmount,
        type: 'credit',
        description: `Booking payment (${payment_id}) - Platform fee: ${platformFee}`,
        created_at: new Date()
      });

      // Update wallet balance
      wallet.balance += vendorAmount;
      await wallet.save();

      // Update booking status
      booking!.status = "Completed";
      await booking!.save();

       res.status(200).json(successResponse("Payment processed successfully", {
        payment,
        wallet_transaction: {
          amount: vendorAmount,
          platform_fee: platformFee
        }
      }));

    } catch (error) {
      console.error("Payment processing error:", error);
       res.status(500).json(failureResponse("Error processing payment"));
    }
  },

  // Get vendor wallet balance and transactions
  async getWalletDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user_id = req.user?._id;
      if (!user_id) {
         res.status(400).json(failureResponse("Vendor ID is required"));
      }

      const vendor = await vendorModel.findOne({ user_id: user_id });
      if (!vendor) {
         res.status(400).json(failureResponse("Vendor not found"));
      }

      const wallet = await Wallet.findOne({ vendor_id: vendor!._id })
        .populate('transactions.booking_id');

      if (!wallet) {
         res.status(200).json(successResponse("Wallet details", {
          balance: 0,
          transactions: []
        }));
      }

       res.status(200).json(successResponse("Wallet details", wallet));
    } catch (error) {
      console.error("Error fetching wallet details:", error);
       res.status(500).json(failureResponse("Error fetching wallet details"));
    }
  },
};

export default PaymentController;
