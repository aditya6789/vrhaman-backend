import { Router } from 'express';
import { initiateAuth, verifyAuth, verifyOTP } from '../controllers/otpless.controller';

const router = Router();

router.post('/initiate', initiateAuth);
router.post('/verify', verifyAuth);
router.post('/verify-otp', verifyOTP);

export default router; 