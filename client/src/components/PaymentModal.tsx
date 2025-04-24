import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { initiateContactPayment, verifyPayment } from '../redux/paymentSlice';
import { PAYSTACK_PUBLIC_KEY, CONTACT_FEE } from '../config/env';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';

interface PaystackWindow extends Window {
  PaystackPop?: {
    setup(config: PaystackConfig): { openIframe(): void };
  };
}

interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  onClose: () => void;
  callback: (response: PaystackResponse) => void;
}

interface PaystackResponse {
  reference: string;
  status: string;
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  listingId: number;
  onSuccess?: () => void;
}

/**
 * PaymentModal component - handles payment processing for contact access
 */
const PaymentModal = ({ open, onClose, listingId, onSuccess }: PaymentModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { pendingPayment, isLoading, error } = useSelector((state: RootState) => state.payment);
  
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');
  
  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setPaymentInitiated(false);
      setVerificationStatus('idle');
    }
  }, [open]);
  
  // Initiate payment process
  const handleInitiatePayment = async () => {
    if (!user) return;
    
    try {
      // Create a payment record on server
      const resultAction = await dispatch(initiateContactPayment(listingId)).unwrap();
      setPaymentInitiated(true);
      
      // If Paystack is available, open payment modal
      if (window && PAYSTACK_PUBLIC_KEY) {
        const paystackWindow = window as PaystackWindow;
        
        if (paystackWindow.PaystackPop) {
          const handler = paystackWindow.PaystackPop.setup({
            key: PAYSTACK_PUBLIC_KEY,
            email: user.email,
            amount: CONTACT_FEE * 100, // convert to kobo (1 NGN = 100 kobo)
            currency: 'NGN',
            ref: resultAction.reference,
            onClose: () => {
              console.log('Payment closed');
            },
            callback: (response) => {
              handlePaymentVerification(response.reference, resultAction.paymentId);
            }
          });
          
          handler.openIframe();
        } else {
          console.error('PaystackPop not available. Make sure Paystack script is loaded.');
        }
      } else {
        // Simulate a successful payment for testing/demo purposes
        // In production, this should not be used
        setTimeout(() => {
          handlePaymentVerification(resultAction.reference, resultAction.paymentId);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to initiate payment:', error);
    }
  };
  
  // Verify payment after completion
  const handlePaymentVerification = async (reference: string, paymentId: number) => {
    setVerificationStatus('verifying');
    
    try {
      await dispatch(verifyPayment({ reference, paymentId })).unwrap();
      setVerificationStatus('success');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      setVerificationStatus('failed');
    }
  };
  
  // Close modal with confirmation if payment is in progress
  const handleClose = () => {
    if (paymentInitiated && verificationStatus !== 'success') {
      const confirmed = window.confirm('Are you sure you want to cancel the payment process?');
      if (confirmed) {
        onClose();
      }
    } else {
      onClose();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase Contact Access</DialogTitle>
          <DialogDescription>
            Pay a one-time fee to access contact details for this property.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {verificationStatus === 'success' ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-green-600 mb-2">Payment Successful!</h3>
              <p className="text-neutral-600">
                You can now view the property owner's contact details.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="bg-neutral-50 p-4 rounded-md">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Contact Access Fee:</span>
                    <span className="font-medium">₦{CONTACT_FEE.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 text-sm text-neutral-500">
                    This grants you access to the property owner's contact details, allowing you to inquire directly.
                  </div>
                </div>
                
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                {verificationStatus === 'verifying' ? (
                  <div className="flex flex-col items-center justify-center py-2">
                    <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin mb-2"></div>
                    <p className="text-neutral-600 text-sm">Verifying payment...</p>
                  </div>
                ) : (
                  <Button 
                    onClick={handleInitiatePayment} 
                    className="w-full" 
                    disabled={isLoading || paymentInitiated}
                  >
                    {isLoading ? 'Processing...' : 'Pay Now (₦' + CONTACT_FEE.toLocaleString() + ')'}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
        
        <DialogFooter className="sm:justify-end">
          {verificationStatus === 'success' ? (
            <Button variant="default" onClick={onClose}>
              Close
            </Button>
          ) : (
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;