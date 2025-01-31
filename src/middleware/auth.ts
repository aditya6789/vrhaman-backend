import { Request, Response, NextFunction } from "express";
import CustomErrorHandler from "../services/CustomErrorHandler";
import JwtService from "../services/JwtService";

export interface DecodedToken {
  _id: string;
  
  user_type: string;
 
}

export interface IRequest extends Request {
  user?: {
    _id: string;
    user_type: string;
    
  };
}

const API_PREFIX = "/api/auth";

const auth = async (req: IRequest, res: Response, next: NextFunction) => {
  const publicRoutes = [
    `${API_PREFIX}/send-otp`,
    `${API_PREFIX}/resend-otp`,
    `${API_PREFIX}/validate-otp`,
    `${API_PREFIX}/send-otp-for-registration`,
    `${API_PREFIX}/validate-otp-for-registration`,
    `${API_PREFIX}/register-admin`,
    `${API_PREFIX}/register-vendor`,
    `${API_PREFIX}/users/vendor/vendor-profile`,
    `${API_PREFIX}/login-admin`,
    `${API_PREFIX}/validate-vendor-otp`,
    '/api/otpless/initiate',
    '/api/otpless/verify',
    '/api/otpless/verify-otp'
  ];
  

  if (publicRoutes.some(route => req.path.includes(route))) {
    // console.log("Public route accessed:", req.path);
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("Authorization header missing");
    return next(CustomErrorHandler.unAuthorized("No authorization header provided"));
  }

  try {
    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("No token provided");
      return next(CustomErrorHandler.unAuthorized("No token provided"));
    }
    // console.log("Token:", token);

    const decodedToken = JwtService.verify(token) as DecodedToken;
    if (!decodedToken || !decodedToken._id) {
      return next(CustomErrorHandler.unAuthorized("Invalid token"));
    }

    // Include all relevant user information from token and normalize case
    req.user = {
      _id: decodedToken._id,
      user_type: decodedToken.user_type.toLowerCase(), // Convert to lowercase
    
    };

    // Validate user type (using lowercase)
    if (!['customer', 'vendor', 'admin'].includes(req.user.user_type)) {
      return next(CustomErrorHandler.unAuthorized("Invalid user type"));
    }

    // console.log("Authenticated user:", {
    //   id: req.user._id,
    //   type: req.user.user_type,
    //   auth_type: req.user.auth_type
    // });

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      console.log("Token expired");
      return next(CustomErrorHandler.unAuthorized("Token expired"));
    } else {
      console.error("JWT verification error:", error);
      return next(CustomErrorHandler.unAuthorized("Invalid token"));
    }
  }
};

export default auth;
