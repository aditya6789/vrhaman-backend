import { Router } from "express";
import NotificationController from "../controllers/notification.controller";

const router = Router();

// Get all notifications for a user
// router.get("/user/:userId", NotificationController.getUserNotifications);

// Create a new notification
router.post("/", NotificationController.createNotification);

router.get("/", NotificationController.getAllNotifications);

// Mark single notification as read
// router.patch("/:id/read", NotificationController.markAsRead);

// Mark all notifications as read for a user
// router.patch("/user/:userId/read-all", NotificationController.markAllAsRead);

// Delete a notification
router.delete("/:id", NotificationController.deleteNotification);

// Get unread notifications count
// router.get("/user/:userId/unread-count", NotificationController.getUnreadCount);

router.post("/send-notification", NotificationController.sendNotificationToAll);

export default router;
