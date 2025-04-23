import { supabase } from '../config/supabaseClient';
import { User, Listing, Verification } from '../types';

/**
 * Service for handling admin-related operations
 */
class AdminService {
  /**
   * Get all users (admin only)
   */
  async getUsers(): Promise<User[]> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser) throw new Error('User not authenticated');

    // Check if user is an admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.user.id)
      .single();

    if (userError) throw new Error(userError.message);
    if (userData.role !== 'admin') throw new Error('Unauthorized access');

    // Get all users
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Format data to match our types
    return (data || []).map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      companyName: user.company_name,
      licenseNumber: user.license_number,
      isVerified: user.is_verified,
      verificationMethod: user.verification_method,
      verificationId: user.verification_id,
      createdAt: user.created_at,
      avatarUrl: user.avatar_url
    }));
  }

  /**
   * Get all pending listings that require approval (admin only)
   */
  async getPendingListings(): Promise<Listing[]> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser) throw new Error('User not authenticated');

    // Check if user is an admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.user.id)
      .single();

    if (userError) throw new Error(userError.message);
    if (userData.role !== 'admin') throw new Error('Unauthorized access');

    // Get pending listings
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        amenities(*),
        user:users(firstName, lastName)
      `)
      .eq('approved', false)
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
   * Get all pending verifications that require review (admin only)
   */
  async getPendingVerifications(): Promise<Verification[]> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser) throw new Error('User not authenticated');

    // Check if user is an admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.user.id)
      .single();

    if (userError) throw new Error(userError.message);
    if (userData.role !== 'admin') throw new Error('Unauthorized access');

    // Get pending verifications
    const { data, error } = await supabase
      .from('verifications')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Format data to match our types
    return (data || []).map(verification => ({
      id: verification.id,
      userId: verification.user_id,
      type: verification.type,
      documentUrl: verification.document_url,
      status: verification.status,
      comments: verification.comments,
      createdAt: verification.created_at,
      updatedAt: verification.updated_at
    }));
  }

  /**
   * Get statistics (admin only)
   */
  async getStatistics(): Promise<{
    totalUsers: number;
    totalListings: number;
    totalPayments: number;
    revenue: number;
  }> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser) throw new Error('User not authenticated');

    // Check if user is an admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.user.id)
      .single();

    if (userError) throw new Error(userError.message);
    if (userData.role !== 'admin') throw new Error('Unauthorized access');

    // Get users count
    const { count: usersCount, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw new Error(usersError.message);

    // Get listings count
    const { count: listingsCount, error: listingsError } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true });

    if (listingsError) throw new Error(listingsError.message);

    // Get payments and revenue
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed');

    if (paymentsError) throw new Error(paymentsError.message);

    // Calculate total revenue
    const revenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    return {
      totalUsers: usersCount || 0,
      totalListings: listingsCount || 0,
      totalPayments: payments.length,
      revenue
    };
  }

  /**
   * Approve a listing (admin only)
   */
  async approveListing(id: number): Promise<void> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser) throw new Error('User not authenticated');

    // Check if user is an admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.user.id)
      .single();

    if (userError) throw new Error(userError.message);
    if (userData.role !== 'admin') throw new Error('Unauthorized access');

    // Approve the listing
    const { error } = await supabase
      .from('listings')
      .update({
        approved: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw new Error(error.message);

    // Get the listing owner to create a notification
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('user_id, title')
      .eq('id', id)
      .single();

    if (listingError) throw new Error(listingError.message);

    // Create a notification for the listing owner
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: listing.user_id,
        type: 'listing_approved',
        title: 'Listing Approved',
        message: `Your listing "${listing.title}" has been approved and is now visible to others.`,
        is_read: false,
        related_id: id,
        created_at: new Date().toISOString()
      });

    if (notificationError) throw new Error(notificationError.message);
  }

  /**
   * Reject a listing (admin only)
   */
  async rejectListing(id: number): Promise<void> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser) throw new Error('User not authenticated');

    // Check if user is an admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.user.id)
      .single();

    if (userError) throw new Error(userError.message);
    if (userData.role !== 'admin') throw new Error('Unauthorized access');

    // Get the listing owner to create a notification
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('user_id, title')
      .eq('id', id)
      .single();

    if (listingError) throw new Error(listingError.message);

    // Create a notification for the listing owner
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: listing.user_id,
        type: 'listing_rejected',
        title: 'Listing Rejected',
        message: `Your listing "${listing.title}" has been rejected. Please review our listing guidelines and try again.`,
        is_read: false,
        related_id: id,
        created_at: new Date().toISOString()
      });

    if (notificationError) throw new Error(notificationError.message);

    // Delete the listing
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  /**
   * Approve a verification (admin only)
   */
  async approveVerification(id: number): Promise<void> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser) throw new Error('User not authenticated');

    // Check if user is an admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.user.id)
      .single();

    if (userError) throw new Error(userError.message);
    if (userData.role !== 'admin') throw new Error('Unauthorized access');

    // Approve the verification
    const { data: verification, error } = await supabase
      .from('verifications')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Update the user's verification status
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        is_verified: true,
        verification_method: verification.type,
        verification_id: verification.id
      })
      .eq('id', verification.user_id);

    if (userUpdateError) throw new Error(userUpdateError.message);

    // Create a notification for the user
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: verification.user_id,
        type: 'verification_approved',
        title: 'Verification Approved',
        message: 'Your verification has been approved. Your account is now verified.',
        is_read: false,
        related_id: id,
        created_at: new Date().toISOString()
      });

    if (notificationError) throw new Error(notificationError.message);
  }

  /**
   * Reject a verification (admin only)
   */
  async rejectVerification(id: number): Promise<void> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser) throw new Error('User not authenticated');

    // Check if user is an admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.user.id)
      .single();

    if (userError) throw new Error(userError.message);
    if (userData.role !== 'admin') throw new Error('Unauthorized access');

    // Get the verification to get the user ID
    const { data: verification, error } = await supabase
      .from('verifications')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Create a notification for the user
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: verification.user_id,
        type: 'verification_rejected',
        title: 'Verification Rejected',
        message: 'Your verification has been rejected. Please review our verification guidelines and try again.',
        is_read: false,
        related_id: id,
        created_at: new Date().toISOString()
      });

    if (notificationError) throw new Error(notificationError.message);
  }
}

// Create and export a singleton instance
const adminService = new AdminService();
export default adminService;