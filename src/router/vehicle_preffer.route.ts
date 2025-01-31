import { Router } from 'express';
import VehiclePreferenceController from '../controllers/vehicle_preffer.controller';


const router = Router();

// Public routes
router.get('/popular-bikes', VehiclePreferenceController.getPopularBikes);
router.get('/popular-cars', VehiclePreferenceController.getPopularCars);
router.get('/best-deals', VehiclePreferenceController.getBestDeals);
router.get('/trending', VehiclePreferenceController.getTrendingVehicles);

// Protected routes
router.get('/user-preferences', VehiclePreferenceController.getUserPreferredVehicles);

export default router; 