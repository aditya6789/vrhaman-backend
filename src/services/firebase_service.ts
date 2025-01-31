import admin from 'firebase-admin';
import notificationTokenModel from '../models/notificationToken.model';

import serviceAccount from '../utils/firebase-account.json';
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

// Function to send a push notification
export const sendPushNotification = async (fcmToken: string, title: string, body: string) => {
  console.log("fcmToken", fcmToken, title, body);
  const message = {
    notification: {
      title,
      body,
    },
    token: fcmToken,
  };

  try {
    await admin.messaging().send(message);
    console.log('Push notification sent successfully');
  } catch (error: any) {
    console.error('Error sending notification:', error);
    if (error.code === 'messaging/registration-token-not-registered') {
      await notificationTokenModel.deleteOne({ token: fcmToken });
      console.log(`Removed invalid token: ${fcmToken}`);
    }
    throw new Error('Failed to send notification');
  }
};

export default admin;
