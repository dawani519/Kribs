/**
 * Type definitions for the Kribs application
 */

// User types
export interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'renter' | 'landlord' | 'manager' | 'admin';
  companyName?: string;
  licenseNumber?: string;
  isVerified: boolean;
  verificationMethod?: 'nin' | 'bvn';
  verificationId?: string;
  createdAt: string;
  avatarUrl?: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  companyName?: string;
  licenseNumber?: string;
}

// Listing types
export interface Listing {
  id: number;
  userId: number;
  title: string;
  type: string;
  category: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
  availableFrom?: string;
  photos: string[];
  amenities?: Amenity[];
  featured: boolean;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListingFormData {
  title: string;
  type: string;
  category: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
  availableFrom?: Date;
  photos: string[];
  amenities: string[];
  featured: boolean;
}

export interface Amenity {
  id: number;
  listingId: number;
  name: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ListingFilter {
  type?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  nearMe?: boolean;
  query?: string;
}

// Chat types
export interface Conversation {
  id: number;
  listingId: number;
  renterId: number;
  ownerId: number;
  lastMessageTime: string;
  createdAt: string;
  listingTitle?: string;
  ownerName?: string;
  renterName?: string;
  unreadCount?: number;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface NewMessage {
  conversationId: number;
  text: string;
}

export interface NewConversation {
  listingId: number;
  ownerId: number;
}

// Payment types
export interface Payment {
  id: number;
  userId: number;
  listingId?: number;
  type: 'listing_fee' | 'contact_fee' | 'featured_fee';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInitiation {
  paymentId: number;
  reference: string;
  amount: number;
  type: string;
}

// Verification types
export interface Verification {
  id: number;
  userId: number;
  method: 'nin' | 'bvn';
  identificationNumber: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface VerificationFormData {
  method: 'nin' | 'bvn';
  identificationNumber: string;
}

// Contact access types
export interface ContactAccess {
  id: number;
  userId: number;
  listingId: number;
  grantedAt: string;
  paymentId?: number;
}

// Notification types
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'message' | 'payment' | 'system' | 'listing';
  isRead: boolean;
  relatedId?: number;
  createdAt: string;
}

// Application state types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ListingState {
  listings: Listing[];
  featuredListings: Listing[];
  recentListings: Listing[];
  nearbyListings: Listing[];
  myListings: Listing[];
  selectedListing: Listing | null;
  isLoading: boolean;
  error: string | null;
}

export interface ChatState {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface PaymentState {
  payments: Payment[];
  pendingPayment: Payment | null;
  isLoading: boolean;
  error: string | null;
}

export interface VerificationState {
  verifications: Verification[];
  currentVerification: Verification | null;
  isLoading: boolean;
  error: string | null;
}

export interface AdminState {
  users: User[];
  pendingListings: Listing[];
  pendingVerifications: Verification[];
  statistics: {
    totalUsers: number;
    totalListings: number;
    totalPayments: number;
    revenue: number;
  };
  isLoading: boolean;
  error: string | null;
}