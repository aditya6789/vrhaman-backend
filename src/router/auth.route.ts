import express, { NextFunction, Request, Response } from "express";
import {
  LoginController,
  RegisterController,
} from "../controllers/auth.controller";
import upload from "../middleware/multer";
import { AuthenticatedRequest } from "../types/auth";
import userController from "../controllers/user.controller";


export const authRouter = express.Router();

authRouter.post(
  "/send-otp",
  async (req: Request, res: Response, next: NextFunction) => {
    await LoginController.sendOtp(req, res, next);
  }
);
authRouter.post(
  "/resend-otp",
  async (req: Request, res: Response, next: NextFunction) => {
    await LoginController.resendOtp(req, res, next);
  }
);

authRouter.post(
  "/validate-otp",
  async (req: Request, res: Response, next: NextFunction) => {
    await LoginController.validateOtp(req, res, next);
  }
);

authRouter.post(
  "/validate-vendor-otp",
  async (req: Request, res: Response, next: NextFunction) => {
    await LoginController.validateVendorOtp(req, res, next);
  }
);


authRouter.post(
  "/register-vendor",upload.single('id_proof') , RegisterController.registerBusiness,
);


authRouter.post(
  "/register-address",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    await RegisterController.registerAddress(req, res, next);
  }
);


authRouter.post(
  "/register-admin",
  async (req: Request, res: Response, next: NextFunction) => {
    await RegisterController.registerAdmin(req, res, next);
  }
  
);
authRouter.post(
  "/login-admin",
  async (req: Request, res: Response, next: NextFunction) => {
    await RegisterController.loginAdmin(req, res);
  }
);


export default authRouter;
