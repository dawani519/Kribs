/**
 * Application constants 
 */

// Property types
export const PROPERTY_TYPES = [
  "1 room",
  "2 room",
  "Self-contain",
  "Flat (1 bedroom)",
  "Flat (2 bedroom)",
  "Flat (3 bedroom)", 
  "Flat (4+ bedroom)",
  "Duplex",
  "Warehouse",
  "Shop",
  "Hall"
];

// Property categories
export const PROPERTY_CATEGORIES = [
  "Long-Term",
  "Short-Term"
];

// User roles
export const USER_ROLES = {
  RENTER: "renter",
  LANDLORD: "landlord",
  MANAGER: "manager",
  ADMIN: "admin"
};

// Amenities
export const AMENITIES = [
  "24/7 Electricity",
  "Water Supply",
  "Security",
  "Parking Space",
  "CCTV",
  "Swimming Pool",
  "Gym",
  "Air Conditioning",
  "Furnished",
  "Internet",
  "Balcony",
  "Garden"
];

// Contact fee structure
export const CONTACT_FEES = {
  NOT_VERIFIED_NOT_LISTED: 10000, // ₦10,000
  VERIFIED_NOT_LISTED: 5000,      // ₦5,000
  VERIFIED_LISTED: 2000           // ₦2,000
};

// Listing fee
export const LISTING_FEES = {
  LANDLORD: 2000,  // ₦2,000
  RENTER: 5000     // ₦5,000
};

// Map settings
export const MAP_SETTINGS = {
  DEFAULT_CENTER: { lat: 6.465422, lng: 3.406448 }, // Lagos, Nigeria
  DEFAULT_ZOOM: 12,
  RADIUS_KM: 5 // Default radius for nearby listings
};

// Verification methods
export const VERIFICATION_METHODS = {
  NIN: "nin",
  BVN: "bvn"
};

// Payment types
export const PAYMENT_TYPES = {
  LISTING_FEE: "listing_fee",
  CONTACT_FEE: "contact_fee"
};

// File upload limits
export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 8
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  LOGOUT: "/api/auth/logout",
  SESSION: "/api/auth/session",
  CHECK_EMAIL: "/api/auth/check-email",
  
  // Users
  PROFILE: "/api/users/profile",
  
  // Verifications
  VERIFICATIONS: "/api/verifications",
  VERIFICATION: "/api/verifications/user", // Single user's verification
  
  // Listings
  LISTINGS: "/api/listings",
  FEATURED_LISTINGS: "/api/listings/featured",
  RECENT_LISTINGS: "/api/listings/recent",
  NEARBY_LISTINGS: "/api/listings/nearby",
  
  // Conversations
  CONVERSATIONS: "/api/conversations",
  
  // Payments
  PAYMENTS: "/api/payments",
  INITIATE_PAYMENT: "/api/payments/initiate",
  VERIFY_PAYMENT: "/api/payments/verify",
  
  // Contact Access
  CONTACT_ACCESS: "/api/contact-access",
  CHECK_ACCESS: "/api/contact-access/check",
  
  // Notifications
  NOTIFICATIONS: "/api/notifications"
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  DEFAULT_OFFSET: 0
};

// App routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  REGISTER_ROLE: "/register/role",
  VERIFICATION: "/verification",
  CHAT: "/chat",
  CHAT_DETAIL: "/chat/:id",
  LISTINGS: "/listings",
  LISTING_DETAIL: "/listings/:id",
  CREATE_LISTING: "/listings/create",
  MY_LISTINGS: "/listings/my",
  MORE: "/more",
  PROFILE: "/profile",
  PAYMENTS: "/payments",
  SETTINGS: "/settings",
  SUPPORT: "/support",
  ADMIN: "/admin"
};

// Theme values
export const THEME = {
  PRIMARY: "#3a9d23", // Leaf green
  PRIMARY_DARK: "#2c7c1a",
  SECONDARY: "#FF6B35",
  SUCCESS: "#27AE60",
  WARNING: "#F39C12",
  ERROR: "#E74C3C"
};
