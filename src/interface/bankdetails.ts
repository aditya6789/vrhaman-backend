export interface IBankDetails {
    name: string;           // Account holder name
    account_number: string; // Bank account number
    ifsc: string;          // IFSC code
    contact_id?: string;   // Razorpay contact ID
    fund_account_id?: string; // Razorpay fund account ID
}
  