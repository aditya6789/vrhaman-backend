import axios from 'axios';

import { Request, Response } from 'express';

export const createContact = async (name: string, email: string, contact: string, referenceId: string) => {
  try {
    const response = await axios.post(
      'https://api.razorpay.com/v1/contacts',
      {
        name,
        email,
        contact,
        type: 'vendor',
        reference_id: referenceId,
        notes: {
          note_key: 'Sample note',
        },
      },
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID || '',
          password: process.env.RAZORPAY_KEY_SECRET || '',
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log("createContact",response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating contact:', error.response?.data || error.message);
    throw error;
  }
};

export const createFundAccount = async (
    contactId: string,
    accountHolderName: string,
    accountNumber: string,
    ifsc: string
  ) => {
    try {
      const response = await axios.post(
        'https://api.razorpay.com/v1/fund_accounts',
        {
          contact_id: contactId,
          account_type: 'bank_account',
          bank_account: {
            name: accountHolderName,
            ifsc,
            account_number: accountNumber,
          },
        },
        {
          auth: {
            username: process.env.RAZORPAY_KEY_ID || '',
            password: process.env.RAZORPAY_KEY_SECRET || '',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log("createFundAccount",response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating fund account:', error.response?.data || error.message);
      throw error;
    }
  };
  export const validateBankAccount = async (accountNumber: string, ifsc: string, amount: number) => {
    console.log("validateBankAccount params:", { accountNumber, ifsc, amount });
    try {
        const response = await axios.post(
            'https://api.razorpay.com/v1/payments/validate/account',
            {
                account_number: accountNumber,
                ifsc: ifsc,
                amount: amount * 100, // Convert to paise
                currency: 'INR',
                notes: {
                    purpose: "Bank account validation"
                }
            },
            {
                auth: {
                    username: process.env.RAZORPAY_KEY_ID || '',
                    password: process.env.RAZORPAY_KEY_SECRET || '',
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log("validateBankAccount response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error validating bank account:', error.response?.data || error.message);
        throw error;
    }
};
    

 


export const addAndValidateBankAccount = async (req: Request, res: Response) => {
    const { name, email, contact, account_number, ifsc, amount, reference_id } = req.body;

    if (!name || !email || !contact || !account_number || !ifsc || !amount || !reference_id) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Step 1: Create Contact first
        const contactData = await createContact(name, email, contact, reference_id);
        const contactId = contactData.id;

        // Step 2: Create Fund Account
        const fundAccountData = await createFundAccount(contactId, name, account_number, ifsc);

        // Step 3: Validate Bank Account
        try {
            await validateBankAccount(account_number, ifsc, amount);
        } catch (validationError) {
            // If validation fails, we still want to save the bank account
            console.warn('Bank validation warning:', validationError);
        }

        return res.status(200).json({
            success: true,
            message: 'Bank account added successfully.',
            data: {
                contact: contactData,
                fundAccount: fundAccountData
            },
        });
    } catch (error: any) {
        // console.log("error", error.response?.data);
        console.error('Error adding bank account:', error.message || error.response?.data);
        res.status(500).json({ 
            success: false, 
            message: error.response?.data?.error?.description || 'Internal Server Error' 
        });
    }
};
