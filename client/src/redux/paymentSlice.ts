import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import paymentService from '../services/paymentService';
import { PaymentState, Payment, PaymentInitiation } from '../types';

// Initial state
const initialState: PaymentState = {
  payments: [],
  pendingPayment: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchPayments = createAsyncThunk(
  'payment/fetchPayments',
  async (_, { rejectWithValue }) => {
    try {
      return await paymentService.getPayments();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch payments');
    }
  }
);

export const initiateListingPayment = createAsyncThunk(
  'payment/initiateListingPayment',
  async ({ listingId, featured }: { listingId: number; featured: boolean }, { rejectWithValue }) => {
    try {
      return await paymentService.initiateListingPayment(listingId, featured);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initiate listing payment');
    }
  }
);

export const initiateContactPayment = createAsyncThunk(
  'payment/initiateContactPayment',
  async (listingId: number, { rejectWithValue }) => {
    try {
      return await paymentService.initiateContactPayment(listingId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initiate contact payment');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'payment/verifyPayment',
  async ({ reference, paymentId }: { reference: string; paymentId: number }, { rejectWithValue }) => {
    try {
      return await paymentService.verifyPayment(reference, paymentId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to verify payment');
    }
  }
);

// Payment slice
const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPendingPayment: (state) => {
      state.pendingPayment = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch payments
    builder.addCase(fetchPayments.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPayments.fulfilled, (state, action: PayloadAction<Payment[]>) => {
      state.isLoading = false;
      state.payments = action.payload;
    });
    builder.addCase(fetchPayments.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Initiate listing payment
    builder.addCase(initiateListingPayment.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(initiateListingPayment.fulfilled, (state, action: PayloadAction<PaymentInitiation>) => {
      state.isLoading = false;
      state.pendingPayment = {
        id: action.payload.paymentId,
        userId: 0, // Will be set by backend
        type: 'listing_fee',
        amount: action.payload.amount,
        status: 'pending',
        reference: action.payload.reference,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
    builder.addCase(initiateListingPayment.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Initiate contact payment
    builder.addCase(initiateContactPayment.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(initiateContactPayment.fulfilled, (state, action: PayloadAction<PaymentInitiation>) => {
      state.isLoading = false;
      state.pendingPayment = {
        id: action.payload.paymentId,
        userId: 0, // Will be set by backend
        listingId: action.payload.paymentId, // This is just a placeholder, real value comes from backend
        type: 'contact_fee',
        amount: action.payload.amount,
        status: 'pending',
        reference: action.payload.reference,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
    builder.addCase(initiateContactPayment.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Verify payment
    builder.addCase(verifyPayment.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(verifyPayment.fulfilled, (state, action: PayloadAction<Payment>) => {
      state.isLoading = false;
      
      // Update the payment in the list
      state.payments = state.payments.map(payment => 
        payment.id === action.payload.id ? action.payload : payment
      );
      
      // Clear pending payment if it's the same one
      if (state.pendingPayment && state.pendingPayment.id === action.payload.id) {
        state.pendingPayment = null;
      }
      
      // Add to payments list if not already present
      if (!state.payments.some(payment => payment.id === action.payload.id)) {
        state.payments = [action.payload, ...state.payments];
      }
    });
    builder.addCase(verifyPayment.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

// Export actions and reducer
export const { clearError, clearPendingPayment } = paymentSlice.actions;
export default paymentSlice.reducer;