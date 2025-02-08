// src/routes/vehicleRoutes.ts

import express from "express";
import {
  getAllVehicles,
  getVehicleDetails,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleByMake,
} from "../controllers/vehicle.controller";
import VendorVehicleController from "../controllers/vendor_vehicle.controller";
import upload from "../middleware/multer";

const router = express.Router();

router.get("/vehicle-details", VendorVehicleController.getVehicleDetails);
router.get("/vehicle-vendor", VendorVehicleController.getAllVendorVehicles);
router.post("/vehicle-vendor", upload.array('images', 10), VendorVehicleController.createVendorVehicle);
router.get("/vehicle-vendor-profile/", VendorVehicleController.getAllVendorProfileVehicles);
router.patch("/vehicle-vendor/status/:id", VendorVehicleController.updateVendorVehicleStatus);
router.patch("/vehicle-vendor/:vehicle_id", VendorVehicleController.updateVendorVehicle);
router.delete("/vehicle-vendor/:id", VendorVehicleController.deleteVendorVehicle);

router.get("/", getAllVehicles);
router.get("/:id", getVehicleDetails);
router.get("/make/:make", getVehicleByMake);
router.post("/", createVehicle);
router.put("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);

export default router;
