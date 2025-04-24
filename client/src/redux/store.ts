import { configureStore } from '@reduxjs/toolkit';

// Import reducers from proper slice files
import authReducer from './slices/authSlice';
import listingReducer from './slices/listingSlice';
import chatReducer from './slices/chatSlice';
import paymentReducer from './slices/paymentSlice';
import notificationReducer from './slices/notificationSlice';

// Configure the store with the slices
export const store = configureStore({
  reducer: {
    auth: authReducer,
    listings: listingReducer,
    chat: chatReducer,
    payment: paymentReducer,
    notifications: notificationReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;