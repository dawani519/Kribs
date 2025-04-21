import { apiRequest } from "@/lib/queryClient";
import { API_ENDPOINTS } from "@/config/constants";

interface ListingFilters {
  userId?: number;
  type?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

interface Amenity {
  id: number;
  listingId: number;
  name: string;
}

interface Listing {
  id: number;
  userId: number;
  title: string;
  type: string;
  category: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  photos: string[];
  availableFrom?: string;
  availableTo?: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
  approved: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  amenities?: Amenity[];
}

interface CreateListingData {
  title: string;
  type: string;
  category: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  photos: string[];
  availableFrom?: string;
  availableTo?: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
  amenities?: string[];
}

class ListingService {
  /**
   * Get all listings with optional filters
   */
  async getListings(filters: ListingFilters = {}): Promise<Listing[]> {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    if (filters.userId) queryParams.append('userId', filters.userId.toString());
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.offset) queryParams.append('offset', filters.offset.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const response = await apiRequest('GET', `${API_ENDPOINTS.LISTINGS}${queryString}`, undefined);
    return response.json();
  }

  /**
   * Get featured listings
   */
  async getFeaturedListings(limit: number = 5): Promise<Listing[]> {
    const response = await apiRequest('GET', `${API_ENDPOINTS.FEATURED_LISTINGS}?limit=${limit}`, undefined);
    return response.json();
  }

  /**
   * Get recent listings
   */
  async getRecentListings(limit: number = 10): Promise<Listing[]> {
    const response = await apiRequest('GET', `${API_ENDPOINTS.RECENT_LISTINGS}?limit=${limit}`, undefined);
    return response.json();
  }

  /**
   * Get nearby listings based on coordinates
   */
  async getNearbyListings(lat: number, lng: number, radius: number = 5, limit: number = 10): Promise<Listing[]> {
    const response = await apiRequest(
      'GET', 
      `${API_ENDPOINTS.NEARBY_LISTINGS}?lat=${lat}&lng=${lng}&radius=${radius}&limit=${limit}`, 
      undefined
    );
    return response.json();
  }

  /**
   * Get a specific listing by ID
   */
  async getListing(id: number): Promise<Listing> {
    const response = await apiRequest('GET', `${API_ENDPOINTS.LISTINGS}/${id}`, undefined);
    return response.json();
  }

  /**
   * Create a new listing
   */
  async createListing(listingData: CreateListingData): Promise<Listing> {
    const response = await apiRequest('POST', API_ENDPOINTS.LISTINGS, listingData);
    return response.json();
  }

  /**
   * Update an existing listing
   */
  async updateListing(id: number, listingData: Partial<CreateListingData>): Promise<Listing> {
    const response = await apiRequest('PUT', `${API_ENDPOINTS.LISTINGS}/${id}`, listingData);
    return response.json();
  }

  /**
   * Delete a listing
   */
  async deleteListing(id: number): Promise<{ message: string }> {
    const response = await apiRequest('DELETE', `${API_ENDPOINTS.LISTINGS}/${id}`, undefined);
    return response.json();
  }

  /**
   * Get current user's listings
   */
  async getMyListings(): Promise<Listing[]> {
    // Get current user first
    const sessionResponse = await apiRequest('GET', API_ENDPOINTS.SESSION, undefined);
    const sessionData = await sessionResponse.json();
    
    if (!sessionData.authenticated) {
      throw new Error('User not authenticated');
    }
    
    // Then get listings with user filter
    return this.getListings({ userId: sessionData.user.id });
  }
}

export default new ListingService();
