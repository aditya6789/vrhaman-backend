import express from "express";
import { userController } from "../controllers/user.controller";
import upload from "../middleware/multer";

const userRouter = express.Router();

// Get all users
userRouter.get("/", userController.getAllUsers);
// Get all customers
userRouter.get("/customers", userController.getAllCustomers);
// Get user profile
userRouter.get("/user/:userId", userController.getUser);
userRouter.get("/document/", userController.getCustomerDocument);
// Update user profile
userRouter.patch("/", upload.single("profile_picture"), userController.updateUser);
// upload document
userRouter.post("/upload-document", upload.single("document"), userController.uploadCustomerDocument);
// Delete user
userRouter.delete("/user/:userId", userController.deleteUser);

// add address
userRouter.post("/address", userController.addAddress);
// get address
userRouter.get("/address", userController.getAddress);


// vendor -- > panel

// vendor dashboard
userRouter.get("/vendor/vendor-dashboard", userController.getVendorProfile);
// get all vendors
userRouter.get("/vendor/all-vendors", userController.getAllVendors);

// get vendor
userRouter.get("/vendor", userController.getVendor);
userRouter.get("/vendor/vendor-details/:userId", userController.getVendorDetails);
// check vendor profile
userRouter.get("/vendor/vendor-profile-exists", userController.checkVendorProfile);

// update vendor profile
userRouter.patch("/vendor/vendor-profile", userController.updateVendorProfile);
// get vendor status
userRouter.get("/vendor/vendor-status", userController.getVendorStatus);
// update vendor status
userRouter.patch("/vendor/vendor-status/:userId", userController.updateVendorStatus);


export default userRouter;
