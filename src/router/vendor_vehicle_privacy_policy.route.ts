import express from "express";
import { 
  createVendorVehiclePrivacyPolicy,
  getVendorVehiclePrivacyPolicy,
  updateVendorVehiclePrivacyPolicy,
  deleteVendorVehiclePrivacyPolicy
} from "../controllers/vendor_vehicle_privacy_policy.controller";


const router = express.Router();

// Create vendor vehicle privacy policy
router.post("/", createVendorVehiclePrivacyPolicy);

// Get vendor vehicle privacy policy
router.get("/", getVendorVehiclePrivacyPolicy);

// Update vendor vehicle privacy policy 
router.put("/",  updateVendorVehiclePrivacyPolicy);

// Delete vendor vehicle privacy policy
router.delete("/", deleteVendorVehiclePrivacyPolicy);

export default router;
