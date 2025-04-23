import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import adminService from '../services/adminService';
import { AdminState, User, Listing, Verification } from '../types';

// Initial state
const initialState: AdminState = {
  users: [],
  pendingListings: [],
  pendingVerifications: [],
  statistics: {
    totalUsers: 0,
    totalListings: 0,
    totalPayments: 0,
    revenue: 0,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getUsers();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch users');
    }
  }
);

export const fetchPendingListings = createAsyncThunk(
  'admin/fetchPendingListings',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getPendingListings();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch pending listings');
    }
  }
);

export const fetchPendingVerifications = createAsyncThunk(
  'admin/fetchPendingVerifications',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getPendingVerifications();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch pending verifications');
    }
  }
);

export const fetchStatistics = createAsyncThunk(
  'admin/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getStatistics();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch statistics');
    }
  }
);

export const approveListing = createAsyncThunk(
  'admin/approveListing',
  async (id: number, { rejectWithValue }) => {
    try {
      await adminService.approveListing(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to approve listing');
    }
  }
);

export const rejectListing = createAsyncThunk(
  'admin/rejectListing',
  async (id: number, { rejectWithValue }) => {
    try {
      await adminService.rejectListing(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reject listing');
    }
  }
);

export const approveVerification = createAsyncThunk(
  'admin/approveVerification',
  async (id: number, { rejectWithValue }) => {
    try {
      await adminService.approveVerification(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to approve verification');
    }
  }
);

export const rejectVerification = createAsyncThunk(
  'admin/rejectVerification',
  async (id: number, { rejectWithValue }) => {
    try {
      await adminService.rejectVerification(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reject verification');
    }
  }
);

// Admin slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch users
    builder.addCase(fetchUsers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
      state.isLoading = false;
      state.users = action.payload;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch pending listings
    builder.addCase(fetchPendingListings.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPendingListings.fulfilled, (state, action: PayloadAction<Listing[]>) => {
      state.isLoading = false;
      state.pendingListings = action.payload;
    });
    builder.addCase(fetchPendingListings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch pending verifications
    builder.addCase(fetchPendingVerifications.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPendingVerifications.fulfilled, (state, action: PayloadAction<Verification[]>) => {
      state.isLoading = false;
      state.pendingVerifications = action.payload;
    });
    builder.addCase(fetchPendingVerifications.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch statistics
    builder.addCase(fetchStatistics.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchStatistics.fulfilled, (state, action: PayloadAction<AdminState['statistics']>) => {
      state.isLoading = false;
      state.statistics = action.payload;
    });
    builder.addCase(fetchStatistics.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Approve listing
    builder.addCase(approveListing.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(approveListing.fulfilled, (state, action: PayloadAction<number>) => {
      state.isLoading = false;
      state.pendingListings = state.pendingListings.filter(listing => listing.id !== action.payload);
    });
    builder.addCase(approveListing.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Reject listing
    builder.addCase(rejectListing.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(rejectListing.fulfilled, (state, action: PayloadAction<number>) => {
      state.isLoading = false;
      state.pendingListings = state.pendingListings.filter(listing => listing.id !== action.payload);
    });
    builder.addCase(rejectListing.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Approve verification
    builder.addCase(approveVerification.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(approveVerification.fulfilled, (state, action: PayloadAction<number>) => {
      state.isLoading = false;
      state.pendingVerifications = state.pendingVerifications.filter(verification => verification.id !== action.payload);
    });
    builder.addCase(approveVerification.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Reject verification
    builder.addCase(rejectVerification.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(rejectVerification.fulfilled, (state, action: PayloadAction<number>) => {
      state.isLoading = false;
      state.pendingVerifications = state.pendingVerifications.filter(verification => verification.id !== action.payload);
    });
    builder.addCase(rejectVerification.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

// Export actions and reducer
export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;