import { Request, Response } from 'express';
import notificationTokenModel from '../models/notificationToken.model';
import userModel from '../models/user.model';
import { AuthenticatedRequest } from '../types/auth';
import { sendPushNotification } from '../services/firebase_service';

// Store FCM token in the database
export const storeFcmToken = async (req: AuthenticatedRequest, res: Response) => {
  console.log(req.body);
  console.log('running');
  try {
    const {  fcmToken , user_type } = req.body;
    const user_id = req.user?._id;

    // Store the FCM token in your database against the driver ID
    // You can use a database like MongoDB or any other to store driver data
    // Example using MongoDB:
    const user = await userModel.findById({_id: user_id});
    if (user) {
      const userToken = new notificationTokenModel({ user_id: user_id, user_type: user_type, token: fcmToken });
      await userToken.save();
      res.status(200).json({ message: 'FCM token saved successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error:any) {
    res.status(500).json({ message: 'Failed to save FCM token', error: error.message });
  }
};

// Check FCM token for a driver
export const checkFcmToken = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user_id = req.user?._id;

    const tokenRecord = await notificationTokenModel.findOne({ user_id: user_id });
    if (tokenRecord) {
      res.status(200).json({ 
        exists: true,
        token: tokenRecord.token 
      });
    } else {
      res.status(200).json({ 
        exists: false,
        message: 'No FCM token found for this user'
      });
    }
  } catch (error:any) {
    res.status(500).json({ message: 'Failed to check FCM token', error: error.message });
  }
};

export const deleteFcmToken = async (req: AuthenticatedRequest, res: Response) => {
  const user_id = req.user?._id;
  await notificationTokenModel.deleteOne({ user_id: user_id });
  res.status(200).json({ message: 'FCM token deleted successfully' });
};

// export const sendNotification = async (req: AuthenticatedRequest, res: Response) => {
//   console.log("running");
//   const user_id = req.user?._id;
//   console.log("user_id", user_id);
//   if(!user_id){
//     res.status(404).json({ message: 'User not found' });
//   }
//   const tokenRecord = await notificationTokenModel.findOne({ user_id: user_id });
//   if(!tokenRecord){
//     res.status(404).json({ message: 'Token not found' });
//   }
//   console.log("tokenRecord", tokenRecord);
//   if (tokenRecord) {
//     await sendPushNotification(tokenRecord.token, "Test Notification", "This is a test notification");
//   }
// };
