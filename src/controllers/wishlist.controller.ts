import { Request, Response } from 'express';
import Wishlist from '../models/wishlist.model';
import { AuthenticatedRequest } from '../types/auth';
import { failureResponse } from '../utils/response';

// Add vehicle to wishlist
export const addToWishlist = async (req: AuthenticatedRequest, res: Response) => {

  const user_id = req.user?._id;
  if (req.user?.user_type !== "customer") {
    return res.status(403).json(failureResponse("Only customers can add to wishlist.", null, 403));
  }
  const {  vehicleId } = req.body;
  console.log(vehicleId);

  try {
    let wishlist = await Wishlist.findOne({ user_id });
    console.log(wishlist);
   

    if (!wishlist) {
      console.log("wishlist not found");
     
      wishlist = new Wishlist({ user_id, vehicles: [vehicleId] });
    } else {
   
      if (!wishlist.vehicles.includes(vehicleId)) {
        wishlist.vehicles.push(vehicleId);
      }
    }

    await wishlist.save();
    console.log(wishlist);
 
    return res.status(200).json({ success: true, message: 'Vehicle added to wishlist', wishlist });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Get user wishlist
export const getUserWishlist = async (req: AuthenticatedRequest, res: Response) => {
  console.log("getUserWishlist");
 const user_id = req.user?._id;
 console.log("user_id", user_id);
 if (req.user?.user_type !== "customer") {
  console.log("user_type not customer");
    return res.status(403).json(failureResponse("Only customers can get wishlist.", null, 403));
  }
  try {
    const wishlist = await Wishlist.findOne({ user_id }).populate({
      path: 'vehicles',
      populate: {
        path: 'vehicle_id'
      }
    });
    if (!wishlist) {
      console.log("wishlist not found");
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    return res.status(200).json({ success: true, wishlist });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Remove vehicle from wishlist
export const removeFromWishlist = async (req: AuthenticatedRequest, res: Response) => {
  const user_id = req.user?._id;
  if (req.user?.user_type !== "customer") {
    return res.status(403).json(failureResponse("Only customers can remove from wishlist.", null, 403));
  }
  const {  vehicle_id } = req.body;

  try {
    const wishlist = await Wishlist.findOne({ user_id });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.vehicles = wishlist.vehicles.filter(v => v.toString() !== vehicle_id);
    await wishlist.save();

    return res.status(200).json({ success: true, message: 'Vehicle removed from wishlist', wishlist });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error });
  }
};
