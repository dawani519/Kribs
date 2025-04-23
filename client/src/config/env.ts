// Environment variables with fallbacks
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';

// Constants
export const CONTACT_FEE = 1000; // ₦1,000
export const LISTING_FEE = 2000; // ₦2,000
export const FEATURED_LISTING_FEE = 5000; // ₦5,000

// Validation
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase credentials are missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment variables.');
}

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('Google Maps API key is missing. Map functionality will be limited.');
}

if (!PAYSTACK_PUBLIC_KEY) {
  console.error('Paystack public key is missing. Make sure VITE_PAYSTACK_PUBLIC_KEY is set in your environment variables.');
}