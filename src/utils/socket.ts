import { Server } from 'socket.io';
import SocketConnection from '../models/socket_connections.model';
import vendorModel from '../models/vendor.model';
import userModel from '../models/user.model';

declare global {
  var io: Server;
}

export const notifyVendor = async (vendorId: string, bookingData: any) => {
  console.log("vendorId", vendorId);
  try {
    if (!global.io) {
      console.error("Socket server not initialized");
      return;
    }

    // Find vendor's socket connection
    const vendor = await vendorModel.findById(vendorId);
    if (!vendor) {
      console.log("Vendor not found");
      return;
    }

    const socketConnection = await SocketConnection.findOne({ 
      userId: vendor.user_id,
      userType: 'vendor'
    });

    if (socketConnection) {
      global.io.to(socketConnection.socketId).emit("newBooking", bookingData);
      console.log(`Notification sent to vendor ${vendorId} via socket ${socketConnection.socketId}`);
    } else {
      console.log(`No active socket connection found for vendor ${vendorId}`);
    }

  } catch (err) {
    console.error("Error sending socket notification:", err);
  }
};

export const notifyCustomer = async (customerId: string, bookingData: any) => {
  console.log("customerId", customerId);
  try {
    if (!global.io) {
      console.error("Socket server not initialized");
      return;
    }

    // Find customer's socket connection
    const customer = await userModel.findById(customerId);
    if (!customer) {
      console.log("Customer not found");
      return;
    }

    const socketConnection = await SocketConnection.findOne({
      userId: customerId,
      userType: 'customer'
    });

    if (socketConnection) {
      global.io.to(socketConnection.socketId).emit("bookingUpdate", bookingData);
      console.log(`Notification sent to customer ${customerId} via socket ${socketConnection.socketId}`);
    } else {
      console.log(`No active socket connection found for customer ${customerId}`);
    }

  } catch (err) {
    console.error("Error sending socket notification:", err);
  }
};