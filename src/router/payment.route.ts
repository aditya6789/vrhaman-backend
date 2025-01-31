import { Router } from 'express';
import PaymentController from '../controllers/payment.controller';


const router = Router();

router.post('/success' , PaymentController.handlePaymentSuccess);
router.get('/wallet', PaymentController.getWalletDetails);
router.post('payment', PaymentController.createPayment);

export default router;
