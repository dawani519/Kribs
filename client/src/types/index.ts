// User Types
export interface User {
  id: number | string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'user' | 'agent' | 'landlord' | 'admin';
  companyName?: string;
  licenseNumber?: string;
  isVerified: boolean;
  verificationMethod?: 'id' | 'license' | 'utility' | 'company';
  verificationId?: number;
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
  role: 'user' | 'agent' | 'landlord';
  companyName?: string;
  licenseNumber?: string;
}

// Listing Types
export interface Listing {
  id: number;
  userId: number;
  title: string;
  description: string;
  type: 'rent' | 'sale' | 'short_stay';
  category: 'apartment' | 'house' | 'land' | 'commercial' | 'shared';
  price: number;
  securityDeposit?: number;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
  furnished: boolean;
  petFriendly: boolean;
  hasParking: boolean;
  availableFrom: string;
  photos: string[];
  approved: boolean;
  featured: boolean;
  isFeatured: boolean;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
  amenities?: Amenity[];
  userName?: string;
}

export interface ListingFormData {
  title: string;
  description: string;
  type: 'rent' | 'sale' | 'short_stay';
  category: 'apartment' | 'house' | 'land' | 'commercial' | 'shared';
  price: number;
  securityDeposit?: number;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
  furnished: boolean;
  petFriendly: boolean;
  hasParking: boolean;
  availableFrom: Date;
  photos: File[];
  contactPhone: string;
  amenities?: string[];
}

export interface Amenity {
  id: number;
  listingId: number;
  name: string;
}

export interface ListingFilters {
  type?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnished?: boolean;
  location?: string;
  radius?: number;
}

// Chat Types
export interface Conversation {
  id: number;
  listingId: number;
  ownerId: number;
  renterId: number;
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

// Payment Types
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
  amount: number;
  reference: string;
  authorizationUrl: string;
}

// Verification Types
export interface Verification {
  id: number;
  userId: number;
  type: 'id' | 'license' | 'utility' | 'company';
  documentUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationFormData {
  type: 'id' | 'license' | 'utility' | 'company';
  document: File;
}

// Notification Types
export interface Notification {
  id: number;
  userId: number;
  type: 'message' | 'listing_approved' | 'listing_rejected' | 'verification_approved' | 'verification_rejected' | 'payment_confirmed';
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: number;
  createdAt: string;
}

// Redux State Types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface ListingState {
  listings: Listing[];
  userListings: Listing[];
  featuredListings: Listing[];
  currentListing: Listing | null;
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