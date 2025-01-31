import express from 'express';
import { createReview, getVehicleReviews } from '../controllers/review.controller';


const router = express.Router();

router.post('/',  createReview); // Create a new review
router.get('/:vehicleId', getVehicleReviews); // Get reviews for a vehicle

export default router;
