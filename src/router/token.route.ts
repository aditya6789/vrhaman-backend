import { Router } from 'express';
import { checkFcmToken, storeFcmToken } from '../controllers/token.controller';
import { sendPushNotification } from '../services/firebase_service';

const router = Router();

// Define the search route
router.post('/', storeFcmToken);
router.get('/', checkFcmToken);
// router.get('/send',sendNotification );

export default router;
