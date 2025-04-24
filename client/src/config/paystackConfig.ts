import { PAYSTACK_PUBLIC_KEY } from './env';

/**
 * Loads the Paystack JavaScript SDK
 */
export const loadPaystackScript = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!PAYSTACK_PUBLIC_KEY) {
      reject(new Error('Paystack public key is missing'));
      return;
    }
    
    // Check if script is already loaded
    if (document.querySelector('script[src*="paystack"]')) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    
    script.onload = () => {
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Paystack script'));
    };
    
    document.body.appendChild(script);
  });
};

export default {
  loadPaystackScript,
  publicKey: PAYSTACK_PUBLIC_KEY,
};