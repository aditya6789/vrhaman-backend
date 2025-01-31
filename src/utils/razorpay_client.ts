import axios from 'axios';
import { IBankDetails } from '../interface/bankdetails';

const razorpayClient = axios.create({
    baseURL: 'https://api.razorpay.com/v1',
    auth: {
        username: process.env.RAZORPAY_KEY_ID || '',
        password: process.env.RAZORPAY_KEY_SECRET || ''
    }
});

export const validateBankAccount = async (bankDetails: IBankDetails) => {
    try {
        const response = await razorpayClient.post('/contacts/bank_transfer_validation', {
            account_number: bankDetails.account_number,
            ifsc: bankDetails.ifsc,
            name: bankDetails.name,
            amount: 100, // Amount in paise (Re. 1)
            currency: "INR"
        });
        return response.data;
    } catch (error: any) {
        console.error('Bank validation error:', error.response?.data || error.message);
        throw error;
    }
};

export const createContact = async (name: string) => {
    try {
        const response = await razorpayClient.post('/contacts', {
            name,
            type: "vendor",
        });
        return response.data;
    } catch (error: any) {
        console.error('Create contact error:', error.response?.data || error.message);
        throw error;
    }
};

export const createFundAccount = async (bankDetails: IBankDetails) => {
    try {
        const response = await razorpayClient.post('/fund_accounts', {
            contact_id: bankDetails.contact_id,
            account_type: "bank_account",
            bank_account: {
                name: bankDetails.name,
                account_number: bankDetails.account_number,
                ifsc: bankDetails.ifsc
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('Create fund account error:', error.response?.data || error.message);
        throw error;
    }
};

export default razorpayClient;
