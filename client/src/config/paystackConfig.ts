// Paystack configuration
export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

// Payment amounts in naira
export const PAYMENT_AMOUNTS = {
  CONTACT_FEE: 500, // ₦500 to view contact info
  LISTING_FEE: 1000, // ₦1000 to list a property
  FEATURED_FEE: 5000, // ₦5000 to feature a property
};

interface PaystackWindow extends Window {
  PaystackPop?: {
    setup(config: any): { openIframe(): void };
  }
}

declare const window: PaystackWindow;

// Function to load the Paystack script
export const loadPaystackScript = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
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
    
    document.body.appendChild(script);
  });
};

// Paystack payment handler
export const handlePaystackPayment = async (config: {
  email: string;
  amount: number;
  onSuccess: (response: { reference: string }) => void;
  onCancel: () => void;
  reference?: string;
  metadata?: any;
}): Promise<void> => {
  if (!PAYSTACK_PUBLIC_KEY) {
    throw new Error('Paystack public key is missing. Please check your environment variables.');
  }
  
  // Ensure the script is loaded
  await loadPaystackScript();
  
  if (!window.PaystackPop) {
    throw new Error('Paystack script not loaded properly');
  }
  
  // Initialize payment
  const paystack = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: config.email,
    amount: config.amount * 100, // Convert to kobo (smallest currency unit)
    currency: 'NGN',
    ref: config.reference || generateReference(),
    metadata: config.metadata || {},
    callback: (response: { reference: string }) => {
      config.onSuccess(response);
    },
    onClose: () => {
      config.onCancel();
    },
  });
  
  // Open the payment modal
  paystack.openIframe();
};

// Generate a unique reference for the transaction
const generateReference = (): string => {
  const timestamp = new Date().getTime().toString();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `KRIBS-${timestamp}-${random}`;
};

export default {
  PAYSTACK_PUBLIC_KEY,
  PAYMENT_AMOUNTS,
  loadPaystackScript,
  handlePaystackPayment,
};