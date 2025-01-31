import { Request, Response } from 'express';
import Notification, { INotification } from '../models/notification.model';
import mongoose, { Types } from 'mongoose';
import notificationTokenModel from '../models/notificationToken.model';
import { sendPushNotification } from '../services/firebase_service';
import { AuthenticatedRequest } from '../types/auth';

export class NotificationController {
    // Create a new notification
    async createNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
        console.log("req.body", req.body);

        try {
            const notification: INotification = new Notification(req.body);
            await notification.save();
            console.log(notification);

            res.status(201).json({ success: true, data: notification });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Failed to create notification' });
        }
    }

    async sendNotificationToAll(req: Request, res: Response): Promise<void> {
        const { title, message, user_type, notification_id } = req.body;
        const notification: INotification | null = await Notification.findById(notification_id);
        if (!notification) {
            res.status(404).json({ success: false, error: 'Notification not found' });
            
        }
        try {
            const userTokens = await notificationTokenModel.find();
            const notificationPromises = userTokens.map(async (userToken) => {
                return sendPushNotification(userToken.token, notification!.title, notification!.message);
            });
            // await Promise.all(notificationPromises);
            res.status(200).json({ success: true, message: 'Notifications sent successfully!' });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Failed to send notifications' });
        }
    }

    async sendNotificationToAllUser(req: Request, res: Response): Promise<void> {
        const { notification_id } = req.body;
        const notification: INotification | null = await Notification.findById(notification_id);
        if (!notification) {
            res.status(404).json({ success: false, error: 'Notification not found' });
        try {
            const userTokens = await notificationTokenModel.find({ user_type: 'User' });
            const notificationPromises = userTokens.map(async (userToken) => {
                return sendPushNotification(userToken.token, notification!.title, notification!.message);
            });
            // await Promise.all(notificationPromises);
            res.status(200).json({ success: true, message: 'Notifications sent successfully!' });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Failed to send notifications' });
        }
            return;
        }
    }
    async sendNotificationToAllVendor(req: Request, res: Response): Promise<void> {
        const { title, message, user_type, notification_id } = req.body;
        const notification: INotification | null = await Notification.findById(notification_id);
        if (!notification) {
            res.status(404).json({ success: false, error: 'Notification not found' });
            
        }
        try {
            const vendorTokens = await notificationTokenModel.find({ user_type: 'Vendor' });
            const notificationPromises = vendorTokens.map(async (vendorToken) => {
                return sendPushNotification(vendorToken.token, notification!.title, notification!.message);
            });
            // await Promise.all(notificationPromises);
            res.status(200).json({ success: true, message: 'Notifications sent successfully!' });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Failed to send notifications' });
        }
    }
    // Send notification to a specific user
 

    async getAllNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const notifications = await Notification.find();
            res.status(200).json({ success: true, data: notifications });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
        }
    }

    async deleteNotification(req: Request, res: Response): Promise<void> {
        console.log("req.params.id", req.params.id);
        try {
            const notificationId = req.params.id;

            const notification = await Notification.findByIdAndDelete(notificationId);

            if (!notification) {
                res.status(404).json({ success: false, error: 'Notification not found' });
                return;
            }

            res.status(200).json({ success: true, message: 'Notification deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Failed to delete notification' });
        }
    }
}

export default new NotificationController();
