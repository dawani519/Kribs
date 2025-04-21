import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS } from '@/config/constants';
import { initializePayment, PAYMENT_AMOUNTS } from '@/config/paystack';
import authService from './auth-service';

interface Payment {
  id: number;
  userId: number;
  amount: number;
  type: string;
  reference: string;
  status: string;
  listingId?: number;
  createdAt: string;
  updatedAt: string;
}

interface PaymentInitiationResponse {
  reference: string;
  paymentId: number;
}

class PaymentService {
  /**
   * Initialize a payment for listing creation
   */
  async initiateListingPayment(listingId: number, featured: boolean = false): Promise<PaymentInitiationResponse> {
    // Determine payment amount based on whether it's a featured listing
    const amount = featured ? PAYMENT_AMOUNTS.FEATURED_LISTING_FEE : PAYMENT_AMOUNTS.LISTING_FEE;
    
    // Get current user
    const user = await authService.getCurrentUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Create payment record in database first
    const response = await apiRequest('POST', API_ENDPOINTS.PAYMENTS, {
      amount,
      type: featured ? 'featured_listing' : 'listing',
      listingId,
    });
    
    const paymentData = await response.json();
    
    return {
      reference: paymentData.reference,
      paymentId: paymentData.id,
    };
  }
  
  /**
   * Initialize a payment for contact access
   */
  async initiateContactAccessPayment(listingId: number): Promise<PaymentInitiationResponse> {
    // Get current user
    const user = await authService.getCurrentUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Create payment record in database first
    const response = await apiRequest('POST', API_ENDPOINTS.PAYMENTS, {
      amount: PAYMENT_AMOUNTS.CONTACT_FEE,
      type: 'contact_access',
      listingId,
    });
    
    const paymentData = await response.json();
    
    return {
      reference: paymentData.reference,
      paymentId: paymentData.id,
    };
  }

  /**
   * Process the payment using Paystack
   */
  async processPayment(paymentReference: string, paymentId: number): Promise<void> {
    // Get current user
    const user = await authService.getCurrentUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    return new Promise((resolve, reject) => {
      initializePayment(
        user.email,
        PAYMENT_AMOUNTS.CONTACT_FEE, // This will be overridden by the backend
        paymentReference,
        async (reference) => {
          // Payment successful
          try {
            // Verify the payment with our backend
            await apiRequest('POST', `${API_ENDPOINTS.VERIFY_PAYMENT}/${paymentId}`, {
              reference,
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        () => {
          // Payment cancelled
          reject(new Error('Payment was cancelled'));
        }
      );
    });
  }

  /**
   * Get user's payment history
   */
  async getPaymentHistory(): Promise<Payment[]> {
    const response = await apiRequest('GET', API_ENDPOINTS.PAYMENTS, undefined);
    return response.json();
  }

  /**
   * Check if the user has access to a listing
   */
  async checkListingAccess(listingId: number): Promise<boolean> {
    try {
      const response = await apiRequest('GET', `${API_ENDPOINTS.CHECK_ACCESS}/${listingId}`, undefined);
      const data = await response.json();
      return data.hasAccess;
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate contact fee based on user status
   */
  calculateContactFee(isVerified: boolean, hasListings: boolean): number {
    if (isVerified && hasListings) {
      return PAYMENT_AMOUNTS.CONTACT_FEE / 2; // 50% discount for verified users with listings
    } else if (isVerified) {
      return PAYMENT_AMOUNTS.CONTACT_FEE * 0.75; // 25% discount for verified users
    } else {
      return PAYMENT_AMOUNTS.CONTACT_FEE;
    }
  }

  /**
   * Get payment fee amounts
   */
  getPaymentAmounts() {
    return PAYMENT_AMOUNTS;
  }
}

export default new PaymentService();