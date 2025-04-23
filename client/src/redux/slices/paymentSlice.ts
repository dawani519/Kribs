import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Payment } from '../../../shared/schema';

// Define the payment state
interface PaymentState {
  payments: Payment[];
  pendingPayment: {
    id: number | null;
    amount: number;
    description: string;
    reference: string;
    type: 'contact_fee' | 'listing_fee' | 'featured_fee';
    listingId?: number;
  } | null;
  contactAccessList: {
    listingId: number;
    hasAccess: boolean;
  }[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: PaymentState = {
  payments: [],
  pendingPayment: null,
  contactAccessList: [],
  isLoading: false,
  error: null
};

// Async thunks for payment actions
export const fetchPayments = createAsyncThunk(
  'payment/fetchPayments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/payments', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch payments');
      }
      
      const data = await response.json();
      return data.payments;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch payments');
    }
  }
);

export const initiateContactFeePayment = createAsyncThunk(
  'payment/initiateContactFeePayment',
  async (listingId: number, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'contact_fee',
          listingId
        }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to initiate payment');
      }
      
      const data = await response.json();
      return {
        ...data.payment,
        listingId
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initiate payment');
    }
  }
);

export const initiateListingFeePayment = createAsyncThunk(
  'payment/initiateListingFeePayment',
  async (listingId: number, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'listing_fee',
          listingId
        }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to initiate payment');
      }
      
      const data = await response.json();
      return {
        ...data.payment,
        listingId
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initiate payment');
    }
  }
);

export const initiateFeaturedFeePayment = createAsyncThunk(
  'payment/initiateFeaturedFeePayment',
  async (listingId: number, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'featured_fee',
          listingId
        }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to initiate payment');
      }
      
      const data = await response.json();
      return {
        ...data.payment,
        listingId
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initiate payment');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'payment/verifyPayment',
  async ({ paymentId, reference }: { paymentId: number; reference: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/payments/verify/${paymentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to verify payment');
      }
      
      const data = await response.json();
      return data.payment;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to verify payment');
    }
  }
);

export const checkContactAccess = createAsyncThunk(
  'payment/checkContactAccess',
  async (listingId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/payments/check-access/${listingId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to check contact access');
      }
      
      const data = await response.json();
      return {
        listingId,
        hasAccess: data.hasAccess
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to check contact access');
    }
  }
);

// Create the payment slice
const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPendingPayment: (state, action: PayloadAction<PaymentState['pendingPayment']>) => {
      state.pendingPayment = action.payload;
    },
    clearPendingPayment: (state) => {
      state.pendingPayment = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch payments
    builder.addCase(fetchPayments.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchPayments.fulfilled, (state, action) => {
      state.isLoading = false;
      state.payments = action.payload;
    });
    builder.addCase(fetchPayments.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Initiate contact fee payment
    builder.addCase(initiateContactFeePayment.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(initiateContactFeePayment.fulfilled, (state, action) => {
      state.isLoading = false;
      state.pendingPayment = action.payload;
    });
    builder.addCase(initiateContactFeePayment.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Initiate listing fee payment
    builder.addCase(initiateListingFeePayment.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(initiateListingFeePayment.fulfilled, (state, action) => {
      state.isLoading = false;
      state.pendingPayment = action.payload;
    });
    builder.addCase(initiateListingFeePayment.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Initiate featured fee payment
    builder.addCase(initiateFeaturedFeePayment.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(initiateFeaturedFeePayment.fulfilled, (state, action) => {
      state.isLoading = false;
      state.pendingPayment = action.payload;
    });
    builder.addCase(initiateFeaturedFeePayment.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Verify payment
    builder.addCase(verifyPayment.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(verifyPayment.fulfilled, (state, action) => {
      state.isLoading = false;
      state.pendingPayment = null;
      state.payments = [action.payload, ...state.payments];
      
      // If it was a contact fee payment, update access
      if (action.payload.type === 'contact_fee' && action.payload.listingId) {
        const existingIndex = state.contactAccessList.findIndex(
          item => item.listingId === action.payload.listingId
        );
        
        if (existingIndex >= 0) {
          state.contactAccessList[existingIndex].hasAccess = true;
        } else {
          state.contactAccessList.push({
            listingId: action.payload.listingId,
            hasAccess: true
          });
        }
      }
    });
    builder.addCase(verifyPayment.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Check contact access
    builder.addCase(checkContactAccess.fulfilled, (state, action) => {
      const existingIndex = state.contactAccessList.findIndex(
        item => item.listingId === action.payload.listingId
      );
      
      if (existingIndex >= 0) {
        state.contactAccessList[existingIndex] = action.payload;
      } else {
        state.contactAccessList.push(action.payload);
      }
    });
  },
});

export const { 
  setPendingPayment, 
  clearPendingPayment, 
  setError, 
  clearError 
} = paymentSlice.actions;

export default paymentSlice.reducer;