import { Router } from 'express';
import VendorVehicleController from '../controllers/vendor_vehicle.controller';
import { getVehicleByMake } from '../controllers/vehicle.controller';
import upload  from '../services/multer';

const router = Router();

// Define the search route
router.get('/', VendorVehicleController.getAllVendorVehicles);
// router.get("/vehicle-search/", getVehicleByMake);

router.post(
  "/", 
  upload.array('images', 5), // Allow up to 5 images
  VendorVehicleController.createVendorVehicle
);

export default router;

