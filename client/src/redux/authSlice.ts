import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService from '../services/authService';
import { AuthState, User, UserCredentials, RegistrationData } from '../types';

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: UserCredentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (registrationData: RegistrationData, { rejectWithValue }) => {
    try {
      return await authService.register(registrationData);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getCurrentUser();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch current user');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      return await authService.updateProfile(userData);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      await authService.resetPassword(email);
      return email;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reset password');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.user = action.payload;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.user = action.payload;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logout.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.isLoading = false;
      state.user = null;
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch current user
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User | null>) => {
      state.isLoading = false;
      state.user = action.payload;
    });
    builder.addCase(fetchCurrentUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update profile
    builder.addCase(updateProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.user = action.payload;
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Reset password
    builder.addCase(resetPassword.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(resetPassword.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

// Export actions and reducer
export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;