import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import listingService from '../services/listingService';
import { ListingState, Listing, ListingFormData, ListingFilters } from '../types';

// Initial state
const initialState: ListingState = {
  listings: [],
  userListings: [],
  featuredListings: [],
  currentListing: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchListings = createAsyncThunk(
  'listings/fetchListings',
  async (filters?: ListingFilters, { rejectWithValue }) => {
    try {
      return await listingService.getListings(filters);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch listings');
    }
  }
);

export const fetchUserListings = createAsyncThunk(
  'listings/fetchUserListings',
  async (_, { rejectWithValue }) => {
    try {
      return await listingService.getUserListings();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user listings');
    }
  }
);

export const fetchFeaturedListings = createAsyncThunk(
  'listings/fetchFeaturedListings',
  async (_, { rejectWithValue }) => {
    try {
      return await listingService.getFeaturedListings();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch featured listings');
    }
  }
);

export const fetchListingById = createAsyncThunk(
  'listings/fetchListingById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await listingService.getListingById(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch listing');
    }
  }
);

export const createListing = createAsyncThunk(
  'listings/createListing',
  async (listingData: ListingFormData, { rejectWithValue }) => {
    try {
      return await listingService.createListing(listingData);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create listing');
    }
  }
);

export const updateListing = createAsyncThunk(
  'listings/updateListing',
  async ({ id, listingData }: { id: number; listingData: Partial<ListingFormData> }, { rejectWithValue }) => {
    try {
      return await listingService.updateListing(id, listingData);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update listing');
    }
  }
);

export const deleteListing = createAsyncThunk(
  'listings/deleteListing',
  async (id: number, { rejectWithValue }) => {
    try {
      await listingService.deleteListing(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete listing');
    }
  }
);

export const searchListings = createAsyncThunk(
  'listings/searchListings',
  async (query: string, { rejectWithValue }) => {
    try {
      return await listingService.searchListings(query);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search listings');
    }
  }
);

export const getNearbyListings = createAsyncThunk(
  'listings/getNearbyListings',
  async ({ lat, lng, radius = 5 }: { lat: number; lng: number; radius?: number }, { rejectWithValue }) => {
    try {
      return await listingService.getNearbyListings(lat, lng, radius);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get nearby listings');
    }
  }
);

// Listing slice
const listingSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentListing: (state, action: PayloadAction<Listing | null>) => {
      state.currentListing = action.payload;
    },
    clearCurrentListing: (state) => {
      state.currentListing = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch listings
    builder.addCase(fetchListings.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchListings.fulfilled, (state, action: PayloadAction<Listing[]>) => {
      state.isLoading = false;
      state.listings = action.payload;
    });
    builder.addCase(fetchListings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch user listings
    builder.addCase(fetchUserListings.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUserListings.fulfilled, (state, action: PayloadAction<Listing[]>) => {
      state.isLoading = false;
      state.userListings = action.payload;
    });
    builder.addCase(fetchUserListings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch featured listings
    builder.addCase(fetchFeaturedListings.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchFeaturedListings.fulfilled, (state, action: PayloadAction<Listing[]>) => {
      state.isLoading = false;
      state.featuredListings = action.payload;
    });
    builder.addCase(fetchFeaturedListings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch listing by ID
    builder.addCase(fetchListingById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchListingById.fulfilled, (state, action: PayloadAction<Listing>) => {
      state.isLoading = false;
      state.currentListing = action.payload;
    });
    builder.addCase(fetchListingById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create listing
    builder.addCase(createListing.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createListing.fulfilled, (state, action: PayloadAction<Listing>) => {
      state.isLoading = false;
      state.userListings = [action.payload, ...state.userListings];
      state.currentListing = action.payload;
    });
    builder.addCase(createListing.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update listing
    builder.addCase(updateListing.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateListing.fulfilled, (state, action: PayloadAction<Listing>) => {
      state.isLoading = false;
      
      // Update in various lists
      state.listings = state.listings.map(listing => 
        listing.id === action.payload.id ? action.payload : listing
      );
      
      state.userListings = state.userListings.map(listing => 
        listing.id === action.payload.id ? action.payload : listing
      );
      
      if (action.payload.featured) {
        const existsInFeatured = state.featuredListings.some(listing => listing.id === action.payload.id);
        if (existsInFeatured) {
          state.featuredListings = state.featuredListings.map(listing => 
            listing.id === action.payload.id ? action.payload : listing
          );
        } else {
          state.featuredListings = [action.payload, ...state.featuredListings];
        }
      }
      
      state.currentListing = action.payload;
    });
    builder.addCase(updateListing.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete listing
    builder.addCase(deleteListing.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteListing.fulfilled, (state, action: PayloadAction<number>) => {
      state.isLoading = false;
      state.listings = state.listings.filter(listing => listing.id !== action.payload);
      state.userListings = state.userListings.filter(listing => listing.id !== action.payload);
      state.featuredListings = state.featuredListings.filter(listing => listing.id !== action.payload);
      
      if (state.currentListing && state.currentListing.id === action.payload) {
        state.currentListing = null;
      }
    });
    builder.addCase(deleteListing.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Search listings
    builder.addCase(searchListings.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(searchListings.fulfilled, (state, action: PayloadAction<Listing[]>) => {
      state.isLoading = false;
      state.listings = action.payload;
    });
    builder.addCase(searchListings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Get nearby listings
    builder.addCase(getNearbyListings.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getNearbyListings.fulfilled, (state, action: PayloadAction<Listing[]>) => {
      state.isLoading = false;
      state.listings = action.payload;
    });
    builder.addCase(getNearbyListings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

// Export actions and reducer
export const { clearError, setCurrentListing, clearCurrentListing } = listingSlice.actions;
export default listingSlice.reducer;