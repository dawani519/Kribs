// Paystack configuration for payment processing

// Get Paystack public key from environment variables
const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

// Check if key is available
if (!paystackPublicKey) {
  console.error('Paystack public key is missing. Make sure VITE_PAYSTACK_PUBLIC_KEY is set in your environment variables.');
}

// Paystack script URL
const PAYSTACK_SCRIPT_URL = 'https://js.paystack.co/v1/inline.js';

// Check if Paystack script is already loaded
const isPaystackLoaded = () => {
  return typeof window !== 'undefined' && window.PaystackPop !== undefined;
};

// Load Paystack script
export const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isPaystackLoaded()) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = PAYSTACK_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.head.appendChild(script);
  });
};

// Paystack API endpoints
export const PAYSTACK_ENDPOINTS = {
  INITIALIZE: 'https://api.paystack.co/transaction/initialize',
  VERIFY: 'https://api.paystack.co/transaction/verify',
};

// Payment types and their amounts
export const PAYMENT_AMOUNTS = {
  CONTACT_FEE: 2000, // ₦2,000 to view contact details
  LISTING_FEE: 5000, // ₦5,000 to publish a listing
  FEATURED_LISTING_FEE: 15000, // ₦15,000 for a featured listing
};

// Initialize Paystack inline payment
export const initializePayment = (
  email: string,
  amount: number,
  reference: string,
  callback: (reference: string) => void,
  onClose: () => void
) => {
  if (!paystackPublicKey) {
    console.error('Cannot initialize payment: Paystack public key is missing');
    return;
  }

  // Ensure Paystack is loaded
  loadPaystackScript().then(() => {
    // Check if PaystackPop is available
    if (window.PaystackPop) {
      const handler = window.PaystackPop.setup({
        key: paystackPublicKey,
        email,
        amount: amount * 100, // Amount is in kobo (multiply by 100)
        ref: reference,
        callback: function(response: any) {
          callback(response.reference);
        },
        onClose: function() {
          onClose();
        },
        currency: 'NGN',
      });
      handler.openIframe();
    } else {
      console.error('Paystack SDK not loaded');
    }
  }).catch(error => {
    console.error('Error loading Paystack:', error);
  });
};

// Add type definition for Paystack
declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: any) => {
        openIframe: () => void;
      };
    };
  }
}

export default {
  initializePayment,
  loadPaystackScript,
  PAYMENT_AMOUNTS,
  PAYSTACK_ENDPOINTS,
};