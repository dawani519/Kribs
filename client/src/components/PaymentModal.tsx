import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from './ui/dialog';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { PAYMENT_AMOUNTS, handlePaystackPayment } from '../config/paystackConfig';

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
  
  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);
  
  // Initiate payment when modal opens
  useEffect(() => {
    if (open && user && !pendingPayment) {
      // In a real implementation, we would dispatch an action to create a payment record
      console.log('Initiating payment for listing ID:', listingId);
    }
  }, [open, user, listingId, pendingPayment, dispatch]);
  
  // Handle Paystack payment
  const handlePayment = async () => {
    if (!user?.email) {
      console.error('User email is required for payment');
      return;
    }
    
    setPaymentProcessing(true);
    
    try {
      // Use Paystack to process the payment
      await handlePaystackPayment({
        email: user.email,
        amount: PAYMENT_AMOUNTS.CONTACT_FEE,
        onSuccess: (response) => {
          console.log('Payment successful:', response);
          
          // In a real implementation, we would dispatch an action to verify the payment
          // and grant access to the contact details
          
          setPaymentProcessing(false);
          
          if (onSuccess) {
            onSuccess();
          }
          
          onClose();
        },
        onCancel: () => {
          console.log('Payment cancelled');
          setPaymentProcessing(false);
        },
        metadata: {
          listing_id: listingId,
          payment_type: 'contact_fee',
        },
      });
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentProcessing(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Unlock Contact Information</DialogTitle>
          <DialogDescription>
            Pay a small fee to access the landlord's contact information and communicate directly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="rounded-lg bg-neutral-50 p-4 mb-4">
            <h4 className="font-semibold text-sm mb-2">Why pay for contacts?</h4>
            <p className="text-sm text-neutral-600">
              This small fee helps us verify serious buyers and renters, reducing spam for property owners.
              You'll have permanent access to this contact after payment.
            </p>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium">Contact Access Fee</span>
            <span className="font-semibold">₦{PAYMENT_AMOUNTS.CONTACT_FEE.toLocaleString()}</span>
          </div>
          
          <div className="mt-4 text-sm text-neutral-500">
            Payment is securely processed by Paystack. Your payment information is not stored on our servers.
          </div>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm mb-4">
            {error}
          </div>
        )}
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading || paymentProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePayment}
            disabled={isLoading || paymentProcessing}
          >
            {(isLoading || paymentProcessing) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ₦${PAYMENT_AMOUNTS.CONTACT_FEE.toLocaleString()}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;