import { AuthenticatedRequest } from "../types/auth";
import { Response, NextFunction } from "express";
import { failureResponse } from "../utils/response";

// vendor middleware

const vendorPermissionMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.user_type !== "Vendor" && req.user?.user_type !== "Admin") {
    return res.status(403).json(failureResponse("Only vendors can access this route."));
  }
  next();
};

export { vendorPermissionMiddleware };

