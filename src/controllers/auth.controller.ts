import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import Otp from "../models/otp.model";
import User from "../models/user.model";
import Vendor from "../models/vendor.model";
import Address from "../models/address.model";
import Refresh from "../models/refresh.model";
import CustomErrorHandler from "../services/CustomErrorHandler";
import JwtService from "../services/JwtService";
import { REFRESH_SECRET } from "../config/index";
import { failureResponse, successResponse } from "../utils/response";
import {
  AuthenticatedRequest,
  RegisterVendorBody,
  SendOtpRequestBody,
  ValidateOtpRequestBody,
} from "../types/auth";
import IdProof from "../models/idproof.model";
import bcrypt from 'bcrypt'; // Import bcrypt for password hashing
import { initiateOTPlessAuth, verifyOTP } from "../services/otp-less-auth";

// Function to generate a 6-digit numeric OTP
const generateNumericOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Add this interface at the top of the file
interface MulterFile {
  path: string;
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
}

export const LoginController = {
  // Send OTP to the user's phone number
  async sendOtp(req: Request, res: Response, next: NextFunction) {
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json(failureResponse('Phone number is required'));
    }
  
    try {
      const numberwith91 = `+91${phone_number}`;
      const response = await initiateOTPlessAuth(numberwith91);
      
      if (!response.success) {
        return res.status(400).json(failureResponse(response.error || 'Authentication failed'));
      }
  
      console.log("response.data", response.data);
      return res.status(200).json(successResponse('Authentication initiated successfully', response.data));
    } catch (error) {
      console.error('OTPless initiation error:', error);
      return res.status(500).json(failureResponse('Failed to initiate authentication'));
    }
  },

  // Validate OTP and redirect to registration if new user
  async validateOtp(req: Request, res: Response, next: NextFunction) {
    const { phone_number, otp , requestId } = req.body;

    if (!phone_number || !otp) {
      return res.status(400).json(failureResponse('Phone number and OTP are required'));
    }
  
    try {
      const numberwith91 = `+91${phone_number}`;

      const response = await verifyOTP(numberwith91, otp, requestId);
      
      if (!response.success) {
        return res.status(400).json(failureResponse(response.error || 'OTP verification failed'));
      }
  
      // Check if user exists
      let user = await User.findOne({ phone: phone_number });
  
      // Create user if doesn't exist
      if (!user) {
        user = await User.create({
          phone: phone_number,
          name: response.data?.userName || '',
          email: response.data?.email || '',
          user_type: 'Customer'
        });
      }
  
      // Generate JWT token with OTPless specific fields
      const authToken = JwtService.sign(
        {
          _id: user._id,
          phone: user.phone,
          user_type: user.user_type,
          name: user.name,
          auth_type: 'Customer',
          timestamp: Date.now()
        },
        "1y",
        process.env.JWT_SECRET || 'your-secret-key',
     
      );
  
      return res.status(200).json(successResponse('OTP verified successfully', {
        user,
        token: authToken
      }));
    } catch (error) {
      console.error('OTP verification error:', error);
      return res.status(500).json(failureResponse('Failed to verify OTP'));
    }
  },

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    const { phone } = req.body as SendOtpRequestBody;
    const otp = generateNumericOtp();

    try {
      // Delete any existing OTP for this phone number
      // await Otp.deleteMany({ phone: phone });
      // Create a new OTP

      const otpRecord = await Otp.findOne({ phone });
      if (otpRecord) {
        const waitTime = 2 * 60 * 1000 - (Date.now() - otpRecord.created_at.getTime());
        if (waitTime > 0) {
          const remainingTime = Math.ceil(waitTime / 1000); // Convert to seconds
          return res.status(400).json(failureResponse(`Please wait ${remainingTime} seconds before requesting a new OTP`, null, 400));
        }
      }

      await Otp.create({ phone, otp, createdAt: new Date(), expires_at: new Date(Date.now() + 5 * 60 * 1000) });
      // Update this line:
      res.status(200).json(successResponse("OTP resent successfully", { otp }));
    } catch (err) {
      return next(err);
    }
  },

  async validateVendorOtp(req: Request, res: Response, next: NextFunction) {

    const { phone_number, otp , requestId , role } = req.body;

    if (!phone_number || !otp) {
      return res.status(400).json(failureResponse('Phone number and OTP are required'));
    }
  
    try {
      const numberwith91 = `+91${phone_number}`;

      const response = await verifyOTP(numberwith91, otp, requestId);
      
      if (!response.success) {
        return res.status(400).json(failureResponse(response.error || 'OTP verification failed'));
      }
  
      // Check if user exists
      let user = await User.findOne({ phone: phone_number });

      

      if (!user) {
        console.log("user not found");
        if (role === "Vendor") {
          console.log("role is vendor");
          // create a new user
          const newUser = new User({ phone: phone_number, user_type: role });
          await newUser.save();
          user = newUser;

          console.log("newUser", newUser);

          // token
          // Generate JWT token with OTPless specific fields
      const authToken = JwtService.sign(
        {
          _id: user._id,
          phone: user.phone,
          user_type: user.user_type,
          name: user.name,
          auth_type: 'Vendor',
          timestamp: Date.now()
        },
        "1y",
        process.env.JWT_SECRET || 'your-secret-key',
     
      );
          return res.status(201).json(
            successResponse("New user. Registration complete.", {
              access_token: authToken,
              user,
              // vendor: null
            })
          );
        }

        return res.status(404).json(failureResponse("Invalid role", null, 404));
      }


      const vendor = await Vendor.findOne({ user_id: user._id });
      console.log("vendor", vendor);
      if(!vendor){
        const authToken = JwtService.sign(
          {
            _id: user._id,
            phone: user.phone,
            user_type: user.user_type,
            name: user.name,
            auth_type: 'Vendor',
            timestamp: Date.now()
          },
          "1y",
          process.env.JWT_SECRET || 'your-secret-key',
       
        );
        return res.status(201).json(successResponse("New vendor. Registration complete.", {
          access_token: authToken,
          user,
          vendor: null
        }));
      }

    
      // If user exists, find associated vendor
   if(user){
    const vendor = await Vendor.findOne({ user_id: user._id });
    console.log("vendor", vendor);

    const access_token = JwtService.sign({
      _id: user._id,
      user_type: user.user_type,
      name: user.name,
    });
    const refresh_token = JwtService.sign(
      { _id: user._id, user_type: user.user_type, name: user.name },
      "1y",
      REFRESH_SECRET
    );
    await Refresh.create({ token: refresh_token });



    res.status(200).json(
      successResponse("Login successfully", {
        access_token,
        refresh_token,
        user,
        vendor
      })
    );
   }
    } catch (err) {
      return next(err);
    }
  },

};




// For Vendor Registration
export const RegisterController = {

  async registerBusiness(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    console.log("Running registerBusiness");
    console.log(req.user);
    if (!req.user || req.user.user_type !== "vendor") {
      console.log("Unauthorized");
      return res.status(401).json(failureResponse("Unauthorized", null, 401));
    }

    console.log("req.body", req.body);


    // add joi validation
    const schema = Joi.object({
      business_name: Joi.string().required(),
      gst_number: Joi.string().required(),
      pancard_number: Joi.string().required(),
      business_address: Joi.string().required(),
      state: Joi.string().required(),
      city: Joi.string().required(),
      pincode: Joi.string().required(),
      alternate_phone: Joi.string().optional(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      address: Joi.string().required(),
      id_proof: Joi.string().required(),
      // id_image: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      console.log("error", error);
      return res.status(400).json(failureResponse(error.details[0].message));
    }




    try {
      const vendor = new Vendor({
        user_id: req.user._id,
        business_name: req.body.business_name,
        business_address: req.body.business_address,
        state: req.body.state,
        pickup_location: {
          latitude: req.body.latitude,
          longitude: req.body.longitude,
          address: req.body.address
        },
        city: req.body.city,
        pincode: req.body.pincode,
        gst_number: req.body.gst_number,
        pancard_number: req.body.pancard_number,
        alternate_phone: req.body.alternate_phone,

      });
      await vendor.save();
      console.log("vendor", vendor);


      const idProof = new IdProof({
        vendor_id: vendor._id,
        id_image: req.body.id_proof,
      });
      await idProof.save();

      console.log("idProof", idProof);
      const updatedVendor = await Vendor.findByIdAndUpdate(vendor._id, { $set: { id_proof: idProof._id } }, { new: true });
      console.log("updatedVendor", updatedVendor);


      res.status(201).json(successResponse("Business registered. Proceed to address details.", vendor));
    } catch (error) {
      console.log(error);
      res.status(500).json(failureResponse("Error registering business"));
    }
  },

  async registerAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // check if its authenticated and is vendor
    if (!req.user || req.user.user_type !== "Vendor") {
      return res.status(401).json(failureResponse("Unauthorized", null, 401));
    }

    // JOI VALIDATION
    const schema = Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postalCode: Joi.string().required(),
      country: Joi.string().required(),
    });


    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json(failureResponse(error.details[0].message));
    }

    try {
      const address = new Address({
        user_id: req.user._id,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        postalCode: req.body.postalCode,
        country: req.body.country,
      });
      await address.save();

      res.status(201).json(successResponse("Address registered. Registration complete.", { address }));
    } catch (error) {
      res.status(500).json(failureResponse("Error registering address"));
    }
  },

  // register admin user with supermaster password
  async registerAdmin(req: Request, res: Response, next: NextFunction) {
    const { name, phone, password, superPassword } = req.body as { name: string; phone: string; password: string; superPassword: string };

    // Validate input
    const schema = Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().length(10).pattern(/^\d+$/).required(),
      password: Joi.string().required(),
      superPassword: Joi.string().required(),
    });

    const { error } = schema.validate({ name, phone, password, superPassword });
    if (error) {
      return res.status(400).json(failureResponse(error.details[0].message));
    }

    // Check for supermaster password
    if (superPassword !== "supermaster") {
      return res.status(401).json(failureResponse("Unauthorized", null, 401));
    }

    try {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      const admin = new User({
        name,
        phone,
        user_type: "Admin",
        password: hashedPassword, // Store hashed password
      });
      await admin.save();

      const access_token = JwtService.sign({
        _id: admin._id,
        user_type: admin.user_type,
        name: admin.name,
      });
      const refresh_token = JwtService.sign(
        { _id: admin._id, user_type: admin.user_type, name: admin.name },
        "1y",
        REFRESH_SECRET
      );
      await Refresh.create({ token: refresh_token });

      res.status(201).json(successResponse("Admin registered successfully", { access_token, refresh_token, user: admin }));
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json(failureResponse("Error registering admin"));
    }
  },
  async loginAdmin(req: Request, res: Response) {
    // Validate input
    const schema = Joi.object({
      phone: Joi.string().length(10).pattern(/^\d+$/).required(),
      password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json(failureResponse(error.details[0].message));
    }

    try {
      // Check if admin exists and include the password field
      const admin = await User.findOne({ phone: req.body.phone, user_type: "Admin" });
      console.log("admin", admin);
      if (!admin) {
        console.log("admin not found");
        console.log(admin);
        return res.status(401).json(failureResponse("Invalid credentials"));
      }

      // Verify password
      if (!admin.password) {
        return res.status(401).json(failureResponse("Invalid credentials"));
      }
      const isPasswordValid = await bcrypt.compare(req.body.password, admin.password);
      if (!isPasswordValid) {
        return res.status(401).json(failureResponse("Invalid credentials"));
      }

      // Generate tokens
      const access_token = JwtService.sign({
        _id: admin._id,
        user_type: admin.user_type,
        name: admin.name
      });

      const refresh_token = JwtService.sign(
        { _id: admin._id, user_type: admin.user_type, name: admin.name },
        "1y",
        REFRESH_SECRET
      );

      await Refresh.create({ token: refresh_token });

      res.json(successResponse("Login successful", {
        access_token,
        refresh_token,
        user: admin
      }));

    } catch (error) {
      console.error(error);
      res.status(500).json(failureResponse("Error logging in"));
    }
  },
};

export default RegisterController;
