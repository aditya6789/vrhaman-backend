import { Request } from "express";

export interface SendOtpRequestBody {
  phone: string;
}

export interface ValidateOtpRequestBody {
  phone: string;
  otp: string;
  role: "Customer" | "Vendor" | "Admin";
}

export interface RegisterVendorBody {
  name: string;
  phone: string;
  address: string;
  location: {
    type: "Point";
    coordinates: number[];
  };
  profile_picture?: string;
}


export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    user_type: string;
    name: string;
    phone?: string;
    auth_type?: 'otpless' | 'regular';
    waId?: string;
  };
}
