import { Router } from 'express';
import { searchVehicles } from '../controllers/search_controller';

const router = Router();

// Define the search route
router.post('/', searchVehicles);

export default router;
