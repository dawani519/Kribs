import { PAYSTACK_PUBLIC_KEY, CONTACT_FEE, LISTING_FEE, FEATURED_LISTING_FEE } from './env';
import { PaystackTransactionProps } from '../types';

// Payment fee constants
export const PAYMENT_AMOUNTS = {
  CONTACT_FEE,
  LISTING_FEE,
  FEATURED_LISTING_FEE
};

// Payment types
export const PAYMENT_TYPES = {
  CONTACT_ACCESS: 'contact_access',
  LISTING_CREATION: 'listing_creation',
  FEATURED_LISTING: 'featured_listing'
};

// Load Paystack script
export const loadPaystackScript = () => {
  return new Promise<void>((resolve, reject) => {
    if (window.PaystackPop) {
      console.log('Paystack already loaded');
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Paystack script loaded successfully');
      resolve();
    };
    
    script.onerror = () => {
      console.error('Failed to load Paystack script');
      reject(new Error('Failed to load Paystack script'));
    };
    
    document.head.appendChild(script);
  });
};

/**
 * Generate a unique transaction reference
 */
export const generateReference = (): string => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000000);
  return `kribs-${timestamp}-${random}`;
};

/**
 * Handle payment using Paystack
 */
export const handlePaystackPayment = ({
  email,
  amount,
  metadata = {},
  onSuccess,
  onCancel
}: PaystackTransactionProps) => {
  if (!PAYSTACK_PUBLIC_KEY) {
    console.error('Paystack public key is missing');
    throw new Error('Paystack public key is missing');
  }

  if (!window.PaystackPop) {
    console.error('Paystack script not loaded');
    throw new Error('Paystack script not loaded');
  }

  const reference = generateReference();
  
  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount: amount * 100, // Paystack expects amount in kobo (1 Naira = 100 Kobo)
    currency: 'NGN',
    ref: reference,
    metadata: {
      ...metadata,
      custom_fields: [
        {
          display_name: "Payment For",
          variable_name: "payment_for",
          value: metadata.payment_type || "Kribs Service"
        }
      ]
    },
    callback: (response: any) => {
      onSuccess(response);
    },
    onClose: () => {
      onCancel();
    }
  });
  
  handler.openIframe();
};

export default {
  loadPaystackScript,
  handlePaystackPayment,
  PAYMENT_TYPES,
  PAYMENT_AMOUNTS
};