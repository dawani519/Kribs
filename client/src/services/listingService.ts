import { supabase } from '../config/supabaseClient';
import { Listing, ListingFormData, ListingFilters } from '../types';

/**
 * Service for handling listing-related operations
 */
class ListingService {
  /**
   * Get all listings with optional filters
   */
  async getListings(filters?: ListingFilters): Promise<Listing[]> {
    let query = supabase
      .from('listings')
      .select(`
        *,
        amenities(*),
        user:users(firstName, lastName)
      `)
      .eq('approved', true);

    // Apply filters
    if (filters) {
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      
      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      
      if (filters.bedrooms) {
        query = query.gte('bedrooms', filters.bedrooms);
      }
      
      if (filters.bathrooms) {
        query = query.gte('bathrooms', filters.bathrooms);
      }
      
      if (filters.furnished !== undefined) {
        query = query.eq('furnished', filters.furnished);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Format data to match our types
    return (data || []).map(listing => ({
      id: listing.id,
      userId: listing.user_id,
      title: listing.title,
      description: listing.description,
      type: listing.type,
      category: listing.category,
      price: listing.price,
      securityDeposit: listing.security_deposit,
      address: listing.address,
      city: listing.city,
      state: listing.state,
      country: listing.country,
      latitude: listing.latitude,
      longitude: listing.longitude,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      squareMeters: listing.square_meters,
      furnished: listing.furnished,
      petFriendly: listing.pet_friendly,
      hasParking: listing.has_parking,
      availableFrom: listing.available_from,
      photos: listing.photos,
      approved: listing.approved,
      featured: listing.featured,
      isFeatured: listing.featured,
      contactPhone: listing.contact_phone,
      createdAt: listing.created_at,
      updatedAt: listing.updated_at,
      userName: listing.user ? `${listing.user.firstName} ${listing.user.lastName}` : undefined,
      amenities: listing.amenities ? listing.amenities.map((amenity: any) => ({
        id: amenity.id,
        listingId: amenity.listing_id,
        name: amenity.name
      })) : []
    }));
  }

  /**
   * Get user's own listings
   */
  async getUserListings(): Promise<Listing[]> {
    const {data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    const supaUser = authData.user;
    if (!supaUser) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        amenities(*)
      `)
      .eq('user_id', supaUser.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Format data to match our types
    return (data || []).map(listing => ({
      id: listing.id,
      userId: listing.user_id,
      title: listing.title,
      description: listing.description,
      type: listing.type,
      category: listing.category,
      price: listing.price,
      securityDeposit: listing.security_deposit,
      address: listing.address,
      city: listing.city,
      state: listing.state,
      country: listing.country,
      latitude: listing.latitude,
      longitude: listing.longitude,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      squareMeters: listing.square_meters,
      furnished: listing.furnished,
      petFriendly: listing.pet_friendly,
      hasParking: listing.has_parking,
      availableFrom: listing.available_from,
      photos: listing.photos,
      approved: listing.approved,
      featured: listing.featured,
      isFeatured: listing.featured,
      contactPhone: listing.contact_phone,
      createdAt: listing.created_at,
      updatedAt: listing.updated_at,
      amenities: listing.amenities ? listing.amenities.map((amenity: any) => ({
        id: amenity.id,
        listingId: amenity.listing_id,
        name: amenity.name
      })) : []
    }));
  }

  /**
   * Get featured listings
   */
  async getFeaturedListings(): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        amenities(*),
        user:users(firstName, lastName)
      `)
      .eq('approved', true)
      .eq('featured', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Format data to match our types
    return (data || []).map(listing => ({
      id: listing.id,
      userId: listing.user_id,
      title: listing.title,
      description: listing.description,
      type: listing.type,
      category: listing.category,
      price: listing.price,
      securityDeposit: listing.security_deposit,
      address: listing.address,
      city: listing.city,
      state: listing.state,
      country: listing.country,
      latitude: listing.latitude,
      longitude: listing.longitude,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      squareMeters: listing.square_meters,
      furnished: listing.furnished,
      petFriendly: listing.pet_friendly,
      hasParking: listing.has_parking,
      availableFrom: listing.available_from,
      photos: listing.photos,
      approved: listing.approved,
      featured: listing.featured,
      isFeatured: listing.featured,
      contactPhone: listing.contact_phone,
      createdAt: listing.created_at,
      updatedAt: listing.updated_at,
      userName: listing.user ? `${listing.user.firstName} ${listing.user.lastName}` : undefined,
      amenities: listing.amenities ? listing.amenities.map((amenity: any) => ({
        id: amenity.id,
        listingId: amenity.listing_id,
        name: amenity.name
      })) : []
    }));
  }

  /**
   * Get listing by ID
   */
  async getListingById(id: number): Promise<Listing> {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        amenities(*),
        user:users(firstName, lastName)
      `)
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);

    // Format data to match our types
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      type: data.type,
      category: data.category,
      price: data.price,
      securityDeposit: data.security_deposit,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      latitude: data.latitude,
      longitude: data.longitude,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      squareMeters: data.square_meters,
      furnished: data.furnished,
      petFriendly: data.pet_friendly,
      hasParking: data.has_parking,
      availableFrom: data.available_from,
      photos: data.photos,
      approved: data.approved,
      featured: data.featured,
      isFeatured: data.featured,
      contactPhone: data.contact_phone,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      userName: data.user ? `${data.user.firstName} ${data.user.lastName}` : undefined,
      amenities: data.amenities ? data.amenities.map((amenity: any) => ({
        id: amenity.id,
        listingId: amenity.listing_id,
        name: amenity.name
      })) : []
    };
  }

  /**
   * Create a new listing
   */
  async createListing(listingData: ListingFormData): Promise<Listing> {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    const supaUser = authData.user;
    if (!supaUser) throw new Error('User not authenticated');

    // Upload photos first
    const photoUrls = await this.uploadPhotos(listingData.photos);

    
    // Insert listing record
    const { data, error } = await supabase
      .from('listings')
      .insert({
        user_id: supaUser.id,
        title: listingData.title,
        description: listingData.description,
        type: listingData.type,
        category: listingData.category,
        price: listingData.price,
        security_deposit: listingData.securityDeposit,
        address: listingData.address,
        city: listingData.city,
        state: listingData.state,
        country: listingData.country,
        latitude: listingData.latitude,
        longitude: listingData.longitude,
        bedrooms: listingData.bedrooms,
        bathrooms: listingData.bathrooms,
        square_meters: listingData.squareMeters,
        furnished: listingData.furnished,
        pet_friendly: listingData.petFriendly,
        has_parking: listingData.hasParking,
        available_from: listingData.availableFrom
        ? listingData.availableFrom.toISOString()
        : null,
        photos: photoUrls,
        approved: false, // Require approval by default
        featured: false, // Not featured by default
        contact_phone: listingData.contactPhone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("🔥 Supabase INSERT error in createListing:", JSON.stringify(error, null, 2));
      // re-throw so your outer catch still runs
      throw error;
    }

    // Add amenities if provided
    if (listingData.amenities && listingData.amenities.length > 0) {
      const amenitiesData = listingData.amenities.map(name => ({
        listing_id: data.id,
        name
      }));

      const { error: amenityError } = await supabase
        .from('amenities')
        .insert(amenitiesData);

      if (amenityError) throw new Error(amenityError.message);
    }

    // Get the full listing with amenities
    return this.getListingById(data.id);
  }

  /**
   * Update an existing listing
   */
  async updateListing(id: number, listingData: Partial<ListingFormData>): Promise<Listing> {
    // ← same destructure:
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    const supaUser = authData.user;
    if (!supaUser) throw new Error('User not authenticated');

    // check ownership
    const { data: existingListing, error: checkError } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', id)
      .single();
    if (checkError) throw new Error(checkError.message);

    // ← compare against supaUser.id, not user.user.id
    if (existingListing.user_id !== supaUser.id) {
      throw new Error('You do not have permission to update this listing');
    }


    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Map fields from camelCase to snake_case
    if (listingData.title) updateData.title = listingData.title;
    if (listingData.description) updateData.description = listingData.description;
    if (listingData.type) updateData.type = listingData.type;
    if (listingData.category) updateData.category = listingData.category;
    if (listingData.price) updateData.price = listingData.price;
    if (listingData.securityDeposit !== undefined) updateData.security_deposit = listingData.securityDeposit;
    if (listingData.address) updateData.address = listingData.address;
    if (listingData.city) updateData.city = listingData.city;
    if (listingData.state) updateData.state = listingData.state;
    if (listingData.country) updateData.country = listingData.country;
    if (listingData.latitude) updateData.latitude = listingData.latitude;
    if (listingData.longitude) updateData.longitude = listingData.longitude;
    if (listingData.bedrooms !== undefined) updateData.bedrooms = listingData.bedrooms;
    if (listingData.bathrooms !== undefined) updateData.bathrooms = listingData.bathrooms;
    if (listingData.squareMeters !== undefined) updateData.square_meters = listingData.squareMeters;
    if (listingData.furnished !== undefined) updateData.furnished = listingData.furnished;
    if (listingData.petFriendly !== undefined) updateData.pet_friendly = listingData.petFriendly;
    if (listingData.hasParking !== undefined) updateData.has_parking = listingData.hasParking;
    if (listingData.availableFrom) updateData.available_from = listingData.availableFrom.toISOString();
    if (listingData.contactPhone) updateData.contact_phone = listingData.contactPhone;

    // Upload new photos if provided
    if (listingData.photos && listingData.photos.length > 0) {
      const photoUrls = await this.uploadPhotos(listingData.photos);
      updateData.photos = photoUrls;
    }

    // Update the listing
    const { error: updateError } = await supabase
      .from('listings')
      .update(updateData)
      .eq('id', id);

    if (updateError) throw new Error(updateError.message);

    // Update amenities if provided
    if (listingData.amenities && listingData.amenities.length > 0) {
      // First delete existing amenities
      const { error: deleteError } = await supabase
        .from('amenities')
        .delete()
        .eq('listing_id', id);

      if (deleteError) throw new Error(deleteError.message);

      // Then add new amenities
      const amenitiesData = listingData.amenities.map(name => ({
        listing_id: id,
        name
      }));

      const { error: amenityError } = await supabase
        .from('amenities')
        .insert(amenitiesData);

      if (amenityError) throw new Error(amenityError.message);
    }

    // Get the updated listing with amenities
    return this.getListingById(id);
  }

  /**
   * Delete a listing
   */
  async deleteListing(id: number): Promise<void> {
    // top of your method
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    const supaUser = authData.user;
    if (!supaUser) throw new Error('User not authenticated');

    // now you can use supaUser.id everywhere …


    // Check if user owns the listing
    const { data: existingListing, error: checkError } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', id)
      .single();

    if (checkError) throw new Error(checkError.message);
    if (existingListing.user_id !== supaUser.id) throw new Error('You do not have permission to delete this listing');

    // Delete amenities first (due to foreign key constraints)
    const { error: amenityError } = await supabase
      .from('amenities')
      .delete()
      .eq('listing_id', id);

    if (amenityError) throw new Error(amenityError.message);

    // Then delete the listing
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  /**
   * Search listings by query
   */
  async searchListings(query: string): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        amenities(*),
        user:users(firstName, lastName)
      `)
      .eq('approved', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Format data to match our types (same as getListings)
    return (data || []).map(listing => ({
      id: listing.id,
      userId: listing.user_id,
      title: listing.title,
      description: listing.description,
      type: listing.type,
      category: listing.category,
      price: listing.price,
      securityDeposit: listing.security_deposit,
      address: listing.address,
      city: listing.city,
      state: listing.state,
      country: listing.country,
      latitude: listing.latitude,
      longitude: listing.longitude,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      squareMeters: listing.square_meters,
      furnished: listing.furnished,
      petFriendly: listing.pet_friendly,
      hasParking: listing.has_parking,
      availableFrom: listing.available_from,
      photos: listing.photos,
      approved: listing.approved,
      featured: listing.featured,
      isFeatured: listing.featured,
      contactPhone: listing.contact_phone,
      createdAt: listing.created_at,
      updatedAt: listing.updated_at,
      userName: listing.user ? `${listing.user.firstName} ${listing.user.lastName}` : undefined,
      amenities: listing.amenities ? listing.amenities.map((amenity: any) => ({
        id: amenity.id,
        listingId: amenity.listing_id,
        name: amenity.name
      })) : []
    }));
  }

  /**
   * Get nearby listings based on coordinates
   */
  async getNearbyListings(lat: number, lng: number, radius: number = 5): Promise<Listing[]> {
    // We need to use a function in Supabase or use client-side filtering
    // For now, we'll just get all approved listings and filter them on the client side
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        amenities(*),
        user:users(firstName, lastName)
      `)
      .eq('approved', true);

    if (error) throw new Error(error.message);

    // Convert listings to our type
    const allListings = (data || []).map(listing => ({
      id: listing.id,
      userId: listing.user_id,
      title: listing.title,
      description: listing.description,
      type: listing.type,
      category: listing.category,
      price: listing.price,
      securityDeposit: listing.security_deposit,
      address: listing.address,
      city: listing.city,
      state: listing.state,
      country: listing.country,
      latitude: listing.latitude,
      longitude: listing.longitude,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      squareMeters: listing.square_meters,
      furnished: listing.furnished,
      petFriendly: listing.pet_friendly,
      hasParking: listing.has_parking,
      availableFrom: listing.available_from,
      photos: listing.photos,
      approved: listing.approved,
      featured: listing.featured,
      isFeatured: listing.featured,
      contactPhone: listing.contact_phone,
      createdAt: listing.created_at,
      updatedAt: listing.updated_at,
      userName: listing.user ? `${listing.user.firstName} ${listing.user.lastName}` : undefined,
      amenities: listing.amenities ? listing.amenities.map((amenity: any) => ({
        id: amenity.id,
        listingId: amenity.listing_id,
        name: amenity.name
      })) : []
    }));

    // Filter listings by distance
    return allListings.filter(listing => {
      const distance = this.calculateDistance(lat, lng, listing.latitude, listing.longitude);
      return distance <= radius;
    });
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Upload photos to Supabase storage
   */
  private async uploadPhotos(photos: File[]): Promise<string[]> {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    const supaUser = authData.user;
    if (!supaUser) throw new Error('User not authenticated');


    const photoUrls: string[] = [];

    for (const photo of photos) {
      const fileName = `${supaUser.id}/${Date.now()}-${photo.name}`;
      
      const { data, error } = await supabase.storage
        .from('listing-photos')
        .upload(fileName, photo);

      if (error) throw new Error(`Failed to upload photo: ${error.message}`);

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('listing-photos')
        .getPublicUrl(data.path);

      photoUrls.push(urlData.publicUrl);
    }

    return photoUrls;
  }
}

// Create and export a singleton instance
const listingService = new ListingService();
export default listingService;