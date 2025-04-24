// API endpoints
export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  SESSION: '/api/auth/session',
  USERS: '/api/users',
  CURRENT_USER: '/api/users/me',
  PROFILE: '/api/users/me/profile',
  CHECK_EMAIL: '/api/auth/check-email',
  
  LISTINGS: '/api/listings',
  LISTING_DETAIL: '/api/listings/:id',
  FEATURED_LISTINGS: '/api/listings/featured',
  NEARBY_LISTINGS: '/api/listings/nearby',
  RECENT_LISTINGS: '/api/listings/recent',
  SEARCH_LISTINGS: '/api/listings/search',
  USER_LISTINGS: '/api/users/me/listings',
  
  CONVERSATIONS: '/api/conversations',
  CONVERSATION_DETAIL: '/api/conversations/:id',
  MESSAGES: '/api/conversations/:id/messages',
  
  PAYMENTS: '/api/payments',
  INITIATE_PAYMENT: '/api/payments/initiate',
  VERIFY_PAYMENT: '/api/payments/verify',
  CHECK_ACCESS: '/api/payments/check-access',
  CONTACT_ACCESS: '/api/payments/contact-access',
  
  VERIFICATIONS: '/api/verifications',
  VERIFICATION: '/api/verifications/status',
  VERIFY_USER: '/api/verifications/:id/verify',
  
  NOTIFICATIONS: '/api/notifications',
};

// Frontend routes
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER_ROLE: '/register/role',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFICATION: '/verification',
  
  // Main tabs
  HOME: '/',
  SEARCH: '/search',
  CHAT: '/chat',
  CHAT_DETAIL: '/chat/:id',
  MORE: '/profile',
  
  // Listings
  LISTING_DETAIL: '/listings/:id',
  CREATE_LISTING: '/create-listing',
  EDIT_LISTING: '/edit-listing/:id',
  MY_LISTINGS: '/my-listings',
  
  // More section
  SAVED_LISTINGS: '/saved',
  PAYMENTS: '/payments',
  SETTINGS: '/settings',
  HELP: '/help',
  
  // Other
  VERIFICATION_STATUS: '/verification-status',
  NOT_FOUND: '/404',
};

// Property types and categories
export const PROPERTY_TYPES = [
  { value: 'rent', label: 'For Rent' },
  { value: 'sale', label: 'For Sale' },
  { value: 'short_stay', label: 'Short Stay' },
];

export const PROPERTY_CATEGORIES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'shared', label: 'Shared' },
];

// Common amenities
export const AMENITIES = [
  'Air Conditioning',
  'Balcony',
  'Dishwasher',
  'Elevator',
  'Furnished',
  'Garden',
  'Gym',
  'Internet/WiFi',
  'Parking',
  'Pet-Friendly',
  'Pool',
  'Security',
  'TV',
  'Washing Machine',
  'Water Heater',
];

// User roles
export const USER_ROLES = [
  { value: 'user', label: 'Renter' },
  { value: 'agent', label: 'Agent' },
  { value: 'landlord', label: 'Landlord' },
];

// Verification methods
export const VERIFICATION_METHODS = {
  ID: 'id',
  LICENSE: 'license',
  UTILITY: 'utility',
  COMPANY: 'company',
  NIN: 'nin',
  BVN: 'bvn'
};

// Verification method options for display
export const VERIFICATION_METHOD_OPTIONS = [
  { value: VERIFICATION_METHODS.ID, label: 'ID Card' },
  { value: VERIFICATION_METHODS.LICENSE, label: 'Driver\'s License' },
  { value: VERIFICATION_METHODS.UTILITY, label: 'Utility Bill' },
  { value: VERIFICATION_METHODS.COMPANY, label: 'Company Registration' },
  { value: VERIFICATION_METHODS.NIN, label: 'National ID Number (NIN)' },
  { value: VERIFICATION_METHODS.BVN, label: 'Bank Verification Number (BVN)' },
];

// App-wide constants
export const APP_NAME = 'Kribs';
export const APP_DESCRIPTION = 'Find your perfect home';
export const CONTACT_EMAIL = 'support@kribs.com';

// Pagination constants
export const DEFAULT_PAGE_SIZE = 10;

// Map settings
export const MAP_SETTINGS = {
  DEFAULT_CENTER: { lat: 6.5244, lng: 3.3792 }, // Lagos, Nigeria
  DEFAULT_ZOOM: 12,
  MAX_ZOOM: 18,
  MIN_ZOOM: 5,
  RADIUS_KM: 5, // Default radius for nearby searches
  API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
};