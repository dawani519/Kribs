// Type definitions for the application

// User related types
export interface UserCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
}

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
}

// Listing related types
export interface Listing {
  id: number;
  userId: number;
  title: string;
  description: string;
  type: 'rent' | 'sale' | 'short_stay';
  category: 'apartment' | 'house' | 'land' | 'commercial' | 'shared';
  price: number;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
  photos: string[];
  amenities: string[];
  featured: boolean;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListingFilter {
  query?: string;
  type?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  nearMe?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Conversation and message types
export interface Conversation {
  id: number;
  renterId: number;
  ownerId: number;
  listingId: number;
  lastMessageTime: string;
  ownerName?: string;
  renterName?: string;
  listingTitle?: string;
  listingPhoto?: string;
  unreadCount?: number;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// Payment related types
export interface Payment {
  id: number;
  userId: number;
  amount: number;
  type: 'contact_fee' | 'listing_fee' | 'featured_fee';
  status: 'pending' | 'success' | 'failed';
  reference: string;
  description: string;
  listingId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactAccess {
  userId: number;
  listingId: number;
  hasAccess: boolean;
  expiresAt?: string;
  paymentId?: number;
}

// Notification types
export interface Notification {
  id: number;
  userId: number;
  type: 'message' | 'payment' | 'listing' | 'verification' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  actionLink?: string;
  referenceId?: number;
  createdAt: string;
}

// Verification types
export interface Verification {
  id: number;
  userId: number;
  type: string;
  documentNumber: string;
  documentImage?: string;
  status: 'pending' | 'verified' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}