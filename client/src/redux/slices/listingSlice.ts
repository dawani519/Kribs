import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Listing } from '../../../shared/schema';

// Define the listings state
interface ListingsState {
  listings: Listing[];
  featuredListings: Listing[];
  recentListings: Listing[];
  nearbyListings: Listing[];
  currentListing: Listing | null;
  userListings: Listing[];
  savedListings: number[];
  searchResults: Listing[];
  isLoading: boolean;
  error: string | null;
  searchParams: {
    query: string;
    type?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    nearMe?: boolean;
    coordinates?: { lat: number; lng: number };
  };
}

// Initial state
const initialState: ListingsState = {
  listings: [],
  featuredListings: [],
  recentListings: [],
  nearbyListings: [],
  currentListing: null,
  userListings: [],
  savedListings: [],
  searchResults: [],
  isLoading: false,
  error: null,
  searchParams: {
    query: '',
  }
};

// Async thunks for listings actions
export const fetchListings = createAsyncThunk(
  'listings/fetchListings',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { searchParams } = (getState() as any).listings;
      
      let url = '/api/listings';
      const queryParams = new URLSearchParams();
      
      if (searchParams.query) {
        queryParams.append('query', searchParams.query);
      }
      
      if (searchParams.type) {
        queryParams.append('type', searchParams.type);
      }
      
      if (searchParams.category) {
        queryParams.append('category', searchParams.category);
      }
      
      if (searchParams.minPrice) {
        queryParams.append('minPrice', searchParams.minPrice.toString());
      }
      
      if (searchParams.maxPrice) {
        queryParams.append('maxPrice', searchParams.maxPrice.toString());
      }
      
      if (searchParams.bedrooms) {
        queryParams.append('bedrooms', searchParams.bedrooms.toString());
      }
      
      if (searchParams.nearMe && searchParams.coordinates) {
        queryParams.append('lat', searchParams.coordinates.lat.toString());
        queryParams.append('lng', searchParams.coordinates.lng.toString());
        queryParams.append('radius', '5'); // 5km radius
      }
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch listings');
      }
      
      const data = await response.json();
      return data.listings;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch listings');
    }
  }
);

export const fetchFeaturedListings = createAsyncThunk(
  'listings/fetchFeaturedListings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/listings/featured', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch featured listings');
      }
      
      const data = await response.json();
      return data.listings;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch featured listings');
    }
  }
);

export const fetchRecentListings = createAsyncThunk(
  'listings/fetchRecentListings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/listings/recent', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch recent listings');
      }
      
      const data = await response.json();
      return data.listings;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch recent listings');
    }
  }
);

export const fetchNearbyListings = createAsyncThunk(
  'listings/fetchNearbyListings',
  async (coordinates: { lat: number; lng: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/listings/nearby?lat=${coordinates.lat}&lng=${coordinates.lng}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch nearby listings');
      }
      
      const data = await response.json();
      return data.listings;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch nearby listings');
    }
  }
);

export const fetchListing = createAsyncThunk(
  'listings/fetchListing',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/listings/${id}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch listing');
      }
      
      const data = await response.json();
      return data.listing;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch listing');
    }
  }
);

export const createListing = createAsyncThunk(
  'listings/createListing',
  async (listingData: any, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listingData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to create listing');
      }
      
      const data = await response.json();
      return data.listing;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create listing');
    }
  }
);

export const updateListing = createAsyncThunk(
  'listings/updateListing',
  async ({ id, listingData }: { id: number; listingData: any }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listingData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to update listing');
      }
      
      const data = await response.json();
      return data.listing;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update listing');
    }
  }
);

export const deleteListing = createAsyncThunk(
  'listings/deleteListing',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to delete listing');
      }
      
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete listing');
    }
  }
);

export const fetchUserListings = createAsyncThunk(
  'listings/fetchUserListings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users/me/listings', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch user listings');
      }
      
      const data = await response.json();
      return data.listings;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user listings');
    }
  }
);

export const saveListing = createAsyncThunk(
  'listings/saveListing',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/me/saved-listings/${id}`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to save listing');
      }
      
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save listing');
    }
  }
);

export const unsaveListing = createAsyncThunk(
  'listings/unsaveListing',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/me/saved-listings/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to unsave listing');
      }
      
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to unsave listing');
    }
  }
);

export const fetchSavedListings = createAsyncThunk(
  'listings/fetchSavedListings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users/me/saved-listings', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch saved listings');
      }
      
      const data = await response.json();
      return data.listingIds;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch saved listings');
    }
  }
);

// Create the listings slice
const listingsSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    setSearchParams: (state, action: PayloadAction<any>) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    clearSearchParams: (state) => {
      state.searchParams = { query: '' };
    },
    setCurrentListing: (state, action: PayloadAction<Listing | null>) => {
      state.currentListing = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch listings
    builder.addCase(fetchListings.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchListings.fulfilled, (state, action) => {
      state.isLoading = false;
      state.listings = action.payload;
      state.searchResults = action.payload;
    });
    builder.addCase(fetchListings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Fetch featured listings
    builder.addCase(fetchFeaturedListings.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchFeaturedListings.fulfilled, (state, action) => {
      state.isLoading = false;
      state.featuredListings = action.payload;
    });
    builder.addCase(fetchFeaturedListings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Fetch recent listings
    builder.addCase(fetchRecentListings.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchRecentListings.fulfilled, (state, action) => {
      state.isLoading = false;
      state.recentListings = action.payload;
    });
    builder.addCase(fetchRecentListings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Fetch nearby listings
    builder.addCase(fetchNearbyListings.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchNearbyListings.fulfilled, (state, action) => {
      state.isLoading = false;
      state.nearbyListings = action.payload;
    });
    builder.addCase(fetchNearbyListings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Fetch single listing
    builder.addCase(fetchListing.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchListing.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentListing = action.payload;
    });
    builder.addCase(fetchListing.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Create listing
    builder.addCase(createListing.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(createListing.fulfilled, (state, action) => {
      state.isLoading = false;
      state.userListings = [action.payload, ...state.userListings];
    });
    builder.addCase(createListing.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Update listing
    builder.addCase(updateListing.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(updateListing.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentListing = action.payload;
      state.userListings = state.userListings.map(listing => 
        listing.id === action.payload.id ? action.payload : listing
      );
    });
    builder.addCase(updateListing.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Delete listing
    builder.addCase(deleteListing.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(deleteListing.fulfilled, (state, action) => {
      state.isLoading = false;
      state.userListings = state.userListings.filter(listing => listing.id !== action.payload);
    });
    builder.addCase(deleteListing.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Fetch user listings
    builder.addCase(fetchUserListings.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchUserListings.fulfilled, (state, action) => {
      state.isLoading = false;
      state.userListings = action.payload;
    });
    builder.addCase(fetchUserListings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Save listing
    builder.addCase(saveListing.fulfilled, (state, action) => {
      if (!state.savedListings.includes(action.payload)) {
        state.savedListings.push(action.payload);
      }
    });
    
    // Unsave listing
    builder.addCase(unsaveListing.fulfilled, (state, action) => {
      state.savedListings = state.savedListings.filter(id => id !== action.payload);
    });
    
    // Fetch saved listings
    builder.addCase(fetchSavedListings.fulfilled, (state, action) => {
      state.savedListings = action.payload;
    });
  },
});

export const { 
  setSearchParams, 
  clearSearchParams, 
  setCurrentListing, 
  clearError 
} = listingsSlice.actions;

export default listingsSlice.reducer;