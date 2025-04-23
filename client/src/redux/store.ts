import { configureStore, createSlice } from '@reduxjs/toolkit';
import { Listing, UserProfile, Conversation, Message, Payment, Notification } from '../types';

// Create initial slices with temporary reducers
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null as UserProfile | null,
    isAuthenticated: false,
    isLoading: false,
    error: null as string | null,
    verificationStatus: 'none' as 'none' | 'pending' | 'verified' | 'rejected'
  },
  reducers: {}
});

const listingSlice = createSlice({
  name: 'listings',
  initialState: {
    listings: [] as Listing[],
    featuredListings: [] as Listing[],
    recentListings: [] as Listing[],
    nearbyListings: [] as Listing[],
    currentListing: null as Listing | null,
    userListings: [] as Listing[],
    savedListings: [] as number[],
    searchResults: [] as Listing[],
    isLoading: false,
    error: null as string | null,
    searchParams: {
      query: ''
    }
  },
  reducers: {}
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [] as Conversation[],
    activeConversation: null as Conversation | null,
    messages: [] as Message[],
    unreadCount: 0,
    isLoading: false,
    error: null as string | null,
    realtimeEnabled: false
  },
  reducers: {}
});

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    payments: [] as Payment[],
    pendingPayment: null as {
      id: number | null;
      amount: number;
      description: string;
      reference: string;
      type: 'contact_fee' | 'listing_fee' | 'featured_fee';
      listingId?: number;
    } | null,
    contactAccessList: [] as {
      listingId: number;
      hasAccess: boolean;
    }[],
    isLoading: false,
    error: null as string | null
  },
  reducers: {}
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [] as Notification[],
    unreadCount: 0,
    isLoading: false,
    error: null as string | null
  },
  reducers: {}
});

// Configure the store with the slices
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    listings: listingSlice.reducer,
    chat: chatSlice.reducer,
    payment: paymentSlice.reducer,
    notifications: notificationSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;