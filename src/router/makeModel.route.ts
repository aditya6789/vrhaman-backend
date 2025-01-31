import { Router } from "express";
import { createMake, getAllMakes, updateMake, deleteMake,  } from "../controllers/makeModel.controller";
import upload from "../middleware/multer";

const router = Router();

router.post("/make", upload.single('image'), createMake);
router.get("/make", getAllMakes);
router.put("/make/:id", updateMake);
router.delete("/make/:id", deleteMake);

// router.get("/vehicle-model/:id", getVehicleModelById);

// router.post("/vehicle-model", createVehicleModel);
// router.get("/vehicle-model", getAllVehicleModels);
// router.put("/vehicle-model/:id", updateVehicleModel);
// router.delete("/vehicle-model/:id", deleteVehicleModel);


export default router;
