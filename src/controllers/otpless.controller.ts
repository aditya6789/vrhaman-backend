import { Request, Response } from 'express';
import { verifyOTPlessToken, initiateOTPlessAuth, verifyOTP as verifyOTPService } from '../services/otp-less-auth';
import { successResponse, failureResponse } from '../utils/response';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';

export const initiateAuth = async (req: Request, res: Response) => {
  const { phone_number } = req.body;

  if (!phone_number) {
    return res.status(400).json(failureResponse('Phone number is required'));
  }

  try {
    const response = await initiateOTPlessAuth(phone_number);
    
    if (!response.success) {
      return res.status(400).json(failureResponse(response.error || 'Authentication failed'));
    }

    return res.status(200).json(successResponse('Authentication initiated successfully', response.data));
  } catch (error) {
    console.error('OTPless initiation error:', error);
    return res.status(500).json(failureResponse('Failed to initiate authentication'));
  }
};

export const verifyAuth = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json(failureResponse('Token is required'));
  }

  try {
    const response = await verifyOTPlessToken(token);
    
    if (!response.success || !response.data) {
      return res.status(400).json(failureResponse(response.error || 'Verification failed'));
    }

    // Check if user exists
    let user = await User.findOne({ phone: response.data.phoneNumber });

    // Create user if doesn't exist
    if (!user) {
      user = await User.create({
        phone: response.data.phoneNumber,
        name: response.data.userName || '',
        email: response.data.email || '',
        user_type: 'customer'
      });
    }

    // Generate JWT token with OTPless specific fields
    const authToken = jwt.sign(
      {
        _id: user._id,
        phone: user.phone,
        user_type: user.user_type,
        name: user.name,
        auth_type: 'otpless',
        waId: response.data.waId,
        timestamp: response.data.timestamp
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return res.status(200).json(successResponse('Authentication successful', {
      user,
      token: authToken
    }));
  } catch (error) {
    console.error('OTPless verification error:', error);
    return res.status(500).json(failureResponse('Failed to verify authentication'));
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { phone_number, otp, requestId } = req.body;

  if (!phone_number || !otp) {
    return res.status(400).json(failureResponse('Phone number and OTP are required'));
  }

  try {
    const response = await verifyOTPService(phone_number, otp, requestId);
    
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

    // Generate JWT token with 5 minute expiration
    const authToken = jwt.sign(
      {
        _id: user._id,
        phone: user.phone,
        user_type: user.user_type,
        name: user.name,
        auth_type: 'customer',
        timestamp: Date.now()
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '5m' } // Set to 5 minutes
    );

    return res.status(200).json(successResponse('OTP verified successfully', {
      user,
      token: authToken
    }));
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json(failureResponse('Failed to verify OTP'));
  }
}; 