import axios from 'axios';

const OTPLESS_CLIENT_ID = process.env.OTPLESS_CLIENT_ID;
const OTPLESS_CLIENT_SECRET = process.env.OTPLESS_CLIENT_SECRET;

interface OTPlessResponse {
  success: boolean;
  data?: {
    waId: string;
    phoneNumber: string;
    timestamp: number;
    userName?: string;
    email?: string;
  };
  error?: string;
}

export const verifyOTPlessToken = async (token: string): Promise<OTPlessResponse> => {
  try {
    const response = await axios.post(
      'https://auth.otpless.app/auth/v1/verify',
      { token },
      {
        headers: {
          clientId: OTPLESS_CLIENT_ID,
          clientSecret: OTPLESS_CLIENT_SECRET,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('OTPless verification error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Verification failed'
    };
  }
};

export const initiateOTPlessAuth = async (phoneNumber: string): Promise<OTPlessResponse> => {
  try {
    const response = await axios.post(
      'https://auth.otpless.app/auth/v1/initiate/otp',
      {
        phoneNumber,
        expiry: 300, // Set to 5 minutes
        otpLength: 6,
        channels: ["WHATSAPP", "SMS"],
        metadata: {
          platform: "mobile_app",
          purpose: "authentication"
        }
      },
      {
        headers: {
          clientId: OTPLESS_CLIENT_ID,
          clientSecret: OTPLESS_CLIENT_SECRET,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('OTPless initiation response:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('OTPless initiation error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Initiation failed'
    };
  }
};

export const verifyOTP = async (phoneNumber: string, otp: string , requestId: string): Promise<OTPlessResponse> => {
  try {
    // const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; // Generate unique request ID

    const response = await axios.post(
      'https://auth.otpless.app/auth/v1/verify/otp',
      {
        requestId,
        otp
      },
      {
        headers: {
          clientId: OTPLESS_CLIENT_ID,
          clientSecret: OTPLESS_CLIENT_SECRET,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('OTP verification response:', response.data);
    console.log("verify otp response", response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('OTP verification error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'OTP verification failed'
    };
  }
};
