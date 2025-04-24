// Environment variables
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';

// Validate required environment variables
export const validateEnv = (): boolean => {
  const requiredVars = [
    { name: 'SUPABASE_URL', value: SUPABASE_URL },
    { name: 'SUPABASE_ANON_KEY', value: SUPABASE_ANON_KEY },
    { name: 'GOOGLE_MAPS_API_KEY', value: GOOGLE_MAPS_API_KEY },
    { name: 'PAYSTACK_PUBLIC_KEY', value: PAYSTACK_PUBLIC_KEY },
  ];

  let valid = true;

  requiredVars.forEach(({ name, value }) => {
    if (!value) {
      console.error(`Missing environment variable: ${name}`);
      valid = false;
    }
  });

  return valid;
};