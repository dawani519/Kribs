import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import verificationService from '../services/verificationService';
import { VerificationState, Verification, VerificationFormData } from '../types';

// Initial state
const initialState: VerificationState = {
  verifications: [],
  currentVerification: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchVerifications = createAsyncThunk(
  'verification/fetchVerifications',
  async (_, { rejectWithValue }) => {
    try {
      return await verificationService.getVerifications();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch verifications');
    }
  }
);

export const createVerification = createAsyncThunk(
  'verification/createVerification',
  async (verificationData: VerificationFormData, { rejectWithValue }) => {
    try {
      return await verificationService.createVerification(verificationData);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create verification');
    }
  }
);

export const checkVerificationStatus = createAsyncThunk(
  'verification/checkVerificationStatus',
  async (id: number, { rejectWithValue }) => {
    try {
      return await verificationService.checkStatus(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to check verification status');
    }
  }
);

// Verification slice
const verificationSlice = createSlice({
  name: 'verification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentVerification: (state, action: PayloadAction<Verification | null>) => {
      state.currentVerification = action.payload;
    },
    clearCurrentVerification: (state) => {
      state.currentVerification = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch verifications
    builder.addCase(fetchVerifications.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchVerifications.fulfilled, (state, action: PayloadAction<Verification[]>) => {
      state.isLoading = false;
      state.verifications = action.payload;
      
      // Set current verification to the most recent one if it exists
      if (action.payload.length > 0) {
        // Find the most recent verification by date
        const sorted = [...action.payload].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        state.currentVerification = sorted[0];
      }
    });
    builder.addCase(fetchVerifications.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create verification
    builder.addCase(createVerification.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createVerification.fulfilled, (state, action: PayloadAction<Verification>) => {
      state.isLoading = false;
      state.verifications = [action.payload, ...state.verifications];
      state.currentVerification = action.payload;
    });
    builder.addCase(createVerification.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Check verification status
    builder.addCase(checkVerificationStatus.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(checkVerificationStatus.fulfilled, (state, action: PayloadAction<Verification>) => {
      state.isLoading = false;
      
      // Update in verifications list
      state.verifications = state.verifications.map(verification => 
        verification.id === action.payload.id ? action.payload : verification
      );
      
      // Update current verification if it's the same one
      if (state.currentVerification && state.currentVerification.id === action.payload.id) {
        state.currentVerification = action.payload;
      }
    });
    builder.addCase(checkVerificationStatus.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

// Export actions and reducer
export const { clearError, setCurrentVerification, clearCurrentVerification } = verificationSlice.actions;
export default verificationSlice.reducer;