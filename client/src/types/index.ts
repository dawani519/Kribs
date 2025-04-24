// Core domain models

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  fullName: string;
  phoneNumber?: string;
  role: 'admin' | 'agent' | 'landlord' | 'user';
  bio?: string;
  avatar?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIDVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  type: string;
  category: string;
  price: number;
  address: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
  photos: string[];
  amenities?: string[];
  ownerId: number;
  ownerName?: string;
  ownerAvatar?: string;
  featured: boolean;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
  saved?: boolean;
}

export interface Conversation {
  id: number;
  listingId: number;
  ownerId: number;
  renterId: number;
  ownerName?: string;
  renterName?: string;
  listingTitle?: string;
  listingPhoto?: string;
  lastMessageTime: string;
  unreadCount?: number;
  createdAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Payment {
  id: number;
  userId: number;
  amount: number;
  currency: string;
  type: 'contact_fee' | 'listing_fee' | 'featured_fee';
  status: 'pending' | 'successful' | 'failed';
  reference: string;
  listingId?: number;
  transactionId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Verification {
  id: number;
  userId: number;
  type: 'email' | 'phone' | 'id' | 'address';
  status: 'pending' | 'verified' | 'rejected';
  documentUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Amenity {
  id: number;
  listingId: number;
  name: string;
  icon?: React.ReactNode;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface ContactAccess {
  id: number;
  userId: number;
  listingId: number;
  hasAccess: boolean;
  paymentId?: number;
  createdAt: string;
}

// Additional frontend-only types
export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ListingState {
  listings: Listing[];
  featuredListings: Listing[];
  recentListings: Listing[];
  savedListings: Listing[];
  currentListing: Listing | null;
  isLoading: boolean;
  error: string | null;
  filters: ListingFilters;
}

export interface ListingFilters {
  query?: string;
  type?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  location?: { lat: number; lng: number; radiusKm: number };
  nearMe?: boolean;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Record<number, Message[]>;
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
}

export interface PaymentState {
  payments: Payment[];
  pendingPayment: Payment | null;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface CoordinatesType {
  lat: number;
  lng: number;
}

// Paystack related types
export interface PaystackTransactionProps {
  email: string;
  amount: number;
  metadata?: Record<string, any>;
  onSuccess: (reference: any) => void;
  onCancel: () => void;
}

export interface PaystackResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  message: string;
  trxref: string;
}

// UI component prop types
export interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  [x: string]: any;
}

// Google Maps and Paystack related types
declare global {
  interface Window {
    google: any;
    PaystackPop: any;
  }
}