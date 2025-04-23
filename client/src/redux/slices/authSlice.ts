import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../../shared/schema';
import { UserCredentials } from '../../types';

// Define the authentication state
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  verificationStatus: 'none' | 'pending' | 'verified' | 'rejected';
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  verificationStatus: 'none'
};

// Async thunks for authentication actions
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: UserCredentials, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Login failed');
      }
      
      const data = await response.json();
      return data.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Logout failed');
      }
      
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Registration failed');
      }
      
      const data = await response.json();
      return data.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          return null; // Not authenticated, but not an error
        }
        const error = await response.json();
        return rejectWithValue(error.message || 'Session check failed');
      }
      
      const data = await response.json();
      return data.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Session check failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users/me/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Profile update failed');
      }
      
      const data = await response.json();
      return data.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Profile update failed');
    }
  }
);

export const checkVerificationStatus = createAsyncThunk(
  'auth/checkVerificationStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/verifications/status', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Verification check failed');
      }
      
      const data = await response.json();
      return data.status;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Verification check failed');
    }
  }
);

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setVerificationStatus: (state, action: PayloadAction<'none' | 'pending' | 'verified' | 'rejected'>) => {
      state.verificationStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Logout
    builder.addCase(logout.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.isLoading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.verificationStatus = 'none';
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Check session
    builder.addCase(checkSession.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(checkSession.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    });
    builder.addCase(checkSession.rejected, (state, action) => {
      state.isLoading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.error = action.payload as string;
    });
    
    // Update profile
    builder.addCase(updateProfile.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Check verification status
    builder.addCase(checkVerificationStatus.fulfilled, (state, action) => {
      state.verificationStatus = action.payload;
    });
  },
});

export const { setUser, setError, clearError, setVerificationStatus } = authSlice.actions;

export default authSlice.reducer;