// Import types from shared schema
import {
  User as SchemaUser,
  Listing as SchemaListing,
  Conversation as SchemaConversation,
  Message as SchemaMessage,
  Payment as SchemaPayment,
  Verification as SchemaVerification,
  Amenity as SchemaAmenity,
  Notification as SchemaNotification,
  ContactAccess as SchemaContactAccess
} from '../../shared/schema';

// Extended types for frontend use
export interface User extends SchemaUser {
  avatar?: string;
}

export interface Listing extends SchemaListing {
  photos: string[];
  saved?: boolean;
}

export interface Conversation extends SchemaConversation {
  ownerName?: string;
  renterName?: string;
  listingTitle?: string;
  listingPhoto?: string;
  unreadCount?: number;
}

export interface Message extends SchemaMessage {
  // Extra frontend-specific properties can be added here
}

export interface Payment extends SchemaPayment {
  // Extra frontend-specific properties can be added here
}

export interface Verification extends SchemaVerification {
  // Extra frontend-specific properties can be added here
}

export interface Amenity extends SchemaAmenity {
  icon?: React.ReactNode;
}

export interface Notification extends SchemaNotification {
  // Extra frontend-specific properties can be added here
}

export interface ContactAccess extends SchemaContactAccess {
  // Extra frontend-specific properties can be added here
}

// Additional frontend-only types
export interface AuthState {
  user: User | null;
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

// Google Maps related type
declare global {
  interface Window {
    google: any;
    PaystackPop: any;
  }
}