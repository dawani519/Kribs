import { GOOGLE_MAPS_API_KEY } from './env';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  PROFILE: '/api/auth/profile',
  VERIFY_EMAIL: '/api/auth/verify/email',
  VERIFY_PHONE: '/api/auth/verify/phone',
  VERIFY_ID: '/api/auth/verify/id',
  
  // Listings
  LISTINGS: '/api/listings',
  LISTING: (id: number) => `/api/listings/${id}`,
  FEATURED_LISTINGS: '/api/listings/featured',
  RECENT_LISTINGS: '/api/listings/recent',
  MY_LISTINGS: '/api/listings/mine',
  SAVED_LISTINGS: '/api/listings/saved',
  NEARBY_LISTINGS: '/api/listings/nearby',
  SAVE_LISTING: (id: number) => `/api/listings/${id}/save`,
  UNSAVE_LISTING: (id: number) => `/api/listings/${id}/unsave`,
  
  // Chat
  CONVERSATIONS: '/api/conversations',
  CONVERSATION: (id: number) => `/api/conversations/${id}`,
  MESSAGES: (conversationId: number) => `/api/conversations/${conversationId}/messages`,
  READ_MESSAGES: (conversationId: number) => `/api/conversations/${conversationId}/read`,
  
  // Payments
  PAYMENTS: '/api/payments',
  PAYMENT: (id: number) => `/api/payments/${id}`,
  VERIFY_PAYMENT: (reference: string) => `/api/payments/verify/${reference}`,
  
  // Contact Access
  CONTACT_ACCESS: (listingId: number) => `/api/listings/${listingId}/contact-access`,
  
  // Notifications
  NOTIFICATIONS: '/api/notifications',
  READ_NOTIFICATION: (id: number) => `/api/notifications/${id}/read`,
  READ_ALL_NOTIFICATIONS: '/api/notifications/read-all',
};

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFICATION: '/auth/verification',
  PROFILE: '/profile',
  EDIT_PROFILE: '/profile/edit',
  LISTINGS: '/listings',
  LISTING_DETAIL: (id: number | string) => `/listings/${id}`,
  CREATE_LISTING: '/listings/create',
  EDIT_LISTING: (id: number | string) => `/listings/${id}/edit`,
  CHAT: '/chat',
  CHAT_CONVERSATION: (id: number | string) => `/chat/${id}`,
  SAVED: '/saved',
  NOTIFICATIONS: '/notifications',
  PAYMENTS: '/payments',
  ABOUT: '/about',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  NOT_FOUND: '/404',
};

// Property types
export const PROPERTY_TYPES = [
  'Apartment',
  'House',
  'Land',
  'Commercial',
  'Shortlet',
];

// Property categories
export const PROPERTY_CATEGORIES = [
  'For Rent',
  'For Sale',
  'For Lease',
  'Short Stay',
  'Joint Venture',
];

// Amenities
export const AMENITIES = [
  'Air Conditioning',
  'Balcony',
  'Furnished',
  'Garden',
  'Gym',
  'Internet',
  'Parking',
  'Pool',
  'Security',
  'Water',
  'Electricity',
  'Generator',
  'Borehole',
  'En-suite Bathroom',
  'Kitchen',
  'Washing Machine',
  'TV',
  'Fridge',
  'Microwave',
];

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  LANDLORD: 'landlord',
  USER: 'user', // Regular user (renter)
};

// Verification methods
export const VERIFICATION_METHODS = {
  EMAIL: 'email',
  PHONE: 'phone',
  ID: 'id',
  ADDRESS: 'address',
};

export const VERIFICATION_METHOD_OPTIONS = [
  { value: VERIFICATION_METHODS.EMAIL, label: 'Email Verification' },
  { value: VERIFICATION_METHODS.PHONE, label: 'Phone Verification' },
  { value: VERIFICATION_METHODS.ID, label: 'ID Verification' },
  { value: VERIFICATION_METHODS.ADDRESS, label: 'Address Verification' },
];

// App info
export const APP_NAME = 'Kribs';
export const APP_DESCRIPTION = 'Find your perfect home';
export const CONTACT_EMAIL = 'support@kribs.com';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;

// Google Maps
export const MAP_SETTINGS = {
  API_KEY: GOOGLE_MAPS_API_KEY,
  DEFAULT_CENTER: { lat: 6.5244, lng: 3.3792 }, // Lagos, Nigeria
  DEFAULT_ZOOM: 12,
};

// Supabase storage bucket names
export const STORAGE_BUCKETS = {
  PROFILE_PICTURES: 'profile-pictures',
  PROPERTY_PHOTOS: 'property-photos',
  VERIFICATION_DOCUMENTS: 'verification-documents',
};

// File upload limits
export const FILE_UPLOAD_LIMITS = {
  PROFILE_PICTURE_SIZE: 2 * 1024 * 1024, // 2MB
  PROPERTY_PHOTO_SIZE: 5 * 1024 * 1024, // 5MB per photo
  MAX_PROPERTY_PHOTOS: 10, // Maximum 10 photos per property
  VERIFICATION_DOCUMENT_SIZE: 5 * 1024 * 1024, // 5MB
};

// Accepted file types
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const ACCEPTED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
];

// Location search radius (in kilometers)
export const DEFAULT_SEARCH_RADIUS_KM = 5;