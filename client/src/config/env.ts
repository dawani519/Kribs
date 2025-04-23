// Environment variables for the frontend
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';

// App constants that would normally be environment variables
export const CONTACT_FEE = 1000; // ₦1,000
export const LISTING_FEE = 2000; // ₦2,000
export const FEATURED_LISTING_FEE = 5000; // ₦5,000

// Function to check if all required environment variables are set
export const checkEnvVariables = (): boolean => {
  const requiredVars = [
    { name: 'VITE_SUPABASE_URL', value: SUPABASE_URL },
    { name: 'VITE_SUPABASE_ANON_KEY', value: SUPABASE_ANON_KEY },
    { name: 'VITE_GOOGLE_MAPS_API_KEY', value: GOOGLE_MAPS_API_KEY },
    { name: 'VITE_PAYSTACK_PUBLIC_KEY', value: PAYSTACK_PUBLIC_KEY },
  ];
  
  let allPresent = true;
  const missing: string[] = [];
  
  requiredVars.forEach(({ name, value }) => {
    if (!value) {
      allPresent = false;
      missing.push(name);
    }
  });
  
  if (!allPresent) {
    console.error('Missing environment variables:', missing.join(', '));
  }
  
  return allPresent;
};

export default {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  GOOGLE_MAPS_API_KEY,
  PAYSTACK_PUBLIC_KEY,
  CONTACT_FEE,
  LISTING_FEE,
  FEATURED_LISTING_FEE,
  checkEnvVariables,
};