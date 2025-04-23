import { supabase } from '../config/supabaseClient';
import { Payment, PaymentInitiation } from '../types';
import { CONTACT_FEE, LISTING_FEE, FEATURED_LISTING_FEE, PAYSTACK_PUBLIC_KEY } from '../config/env';

/**
 * Service for handling payment-related operations
 */
class PaymentService {
  /**
   * Get all payments for the current user
   */
  async getPayments(): Promise<Payment[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Format data to match our types
    return (data || []).map(payment => ({
      id: payment.id,
      userId: payment.user_id,
      listingId: payment.listing_id,
      type: payment.type,
      amount: payment.amount,
      status: payment.status,
      reference: payment.reference,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at
    }));
  }

  /**
   * Initiate payment for listing a property
   */
  async initiateListingPayment(listingId: number, featured: boolean): Promise<PaymentInitiation> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if Paystack is configured
    if (!PAYSTACK_PUBLIC_KEY) {
      throw new Error('Payment gateway not configured');
    }

    // Determine the amount based on whether it's a featured listing
    const amount = featured ? FEATURED_LISTING_FEE : LISTING_FEE;
    
    // Generate a unique reference
    const reference = `listing_${listingId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Create a payment record
    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: user.user.id,
        listing_id: listingId,
        type: featured ? 'featured_fee' : 'listing_fee',
        amount,
        status: 'pending',
        reference,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // In a real implementation, this would call the Paystack API
    // to initialize a transaction and get an authorization URL
    const authorizationUrl = `https://paystack.com/pay/${reference}`;

    return {
      paymentId: data.id,
      amount,
      reference,
      authorizationUrl
    };
  }

  /**
   * Initiate payment for accessing contact details
   */
  async initiateContactPayment(listingId: number): Promise<PaymentInitiation> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if Paystack is configured
    if (!PAYSTACK_PUBLIC_KEY) {
      throw new Error('Payment gateway not configured');
    }
    
    // Generate a unique reference
    const reference = `contact_${listingId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Create a payment record
    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: user.user.id,
        listing_id: listingId,
        type: 'contact_fee',
        amount: CONTACT_FEE,
        status: 'pending',
        reference,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // In a real implementation, this would call the Paystack API
    // to initialize a transaction and get an authorization URL
    const authorizationUrl = `https://paystack.com/pay/${reference}`;

    return {
      paymentId: data.id,
      amount: CONTACT_FEE,
      reference,
      authorizationUrl
    };
  }

  /**
   * Verify a payment
   */
  async verifyPayment(reference: string, paymentId: number): Promise<Payment> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // In a real implementation, this would call the Paystack API
    // to verify the transaction status using the reference
    
    // For the sake of the example, we'll just update the payment status to 'completed'
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .eq('reference', reference)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // If this is a contact fee payment, grant access to contact details
    if (data.type === 'contact_fee') {
      await this.grantContactAccess(data.user_id, data.listing_id, data.id);
    }
    
    // If this is a listing or featured fee payment, mark the listing as approved or featured
    if (data.type === 'listing_fee' || data.type === 'featured_fee') {
      const updateData: { approved?: boolean; featured?: boolean } = {};
      
      if (data.type === 'listing_fee') {
        updateData.approved = true;
      }
      
      if (data.type === 'featured_fee') {
        updateData.featured = true;
      }
      
      const { error: listingError } = await supabase
        .from('listings')
        .update(updateData)
        .eq('id', data.listing_id);
        
      if (listingError) throw new Error(listingError.message);
    }

    // Format and return the payment
    return {
      id: data.id,
      userId: data.user_id,
      listingId: data.listing_id,
      type: data.type,
      amount: data.amount,
      status: data.status,
      reference: data.reference,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  /**
   * Grant access to contact details after payment
   */
  private async grantContactAccess(userId: number, listingId: number, paymentId: number): Promise<void> {
    const { error } = await supabase
      .from('contact_access')
      .insert({
        user_id: userId,
        listing_id: listingId,
        payment_id: paymentId,
        granted_at: new Date().toISOString()
      });

    if (error) throw new Error(error.message);
  }
}

// Create and export a singleton instance
const paymentService = new PaymentService();
export default paymentService;