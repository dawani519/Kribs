import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import paymentService from "@/services/payment-service";
import listingService from "@/services/listing-service";
import { formatPrice } from "@/lib/utils";
import { initializePayment, PAYMENT_AMOUNTS } from "@/config/paystack";
import { apiRequest } from "@/lib/queryClient";
import { API_ENDPOINTS } from "@/config/constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  listingId: number;
  onSuccess?: () => void;
}

const PaymentModal = ({ open, onClose, listingId, onSuccess }: PaymentModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listing, setListing] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [contactFee, setContactFee] = useState(0);

  // Fetch listing details
  useEffect(() => {
    if (open && listingId) {
      const fetchListingDetails = async () => {
        try {
          setLoading(true);
          const listingData = await listingService.getListing(listingId);
          setListing(listingData);
          
          // Get owner details
          // In a real app, we would fetch the owner's details
          setOwner({
            id: listingData.userId,
            name: "Property Owner", // Placeholder
            avatar: null // Placeholder
          });
          
          // Calculate contact fee
          if (user) {
            // Check if user has any listings
            const myListings = await listingService.getMyListings();
            const hasListings = myListings.length > 0;
            
            // Calculate fee based on verification status and listings
            const fee = paymentService.calculateContactFee(user.isVerified, hasListings);
            setContactFee(fee);
          }
          
          setLoading(false);
        } catch (error) {
          console.error("Error fetching listing details:", error);
          toast({
            title: "Error",
            description: "Failed to load listing details. Please try again.",
            variant: "destructive",
          });
          onClose();
        }
      };
      
      fetchListingDetails();
    }
  }, [open, listingId, user]);
  
  const handlePayment = async () => {
    if (!user || !listing) return;
    
    try {
      setProcessingPayment(true);
      
      // Initiate payment using our backend
      const paymentInitiation = await paymentService.initiateContactAccessPayment(listingId);
      
      // Process the payment using Paystack
      initializePayment(
        user.email,
        contactFee,
        paymentInitiation.reference,
        async (reference) => {
          // Verify payment on our backend
          try {
            await apiRequest('POST', `${API_ENDPOINTS.VERIFY_PAYMENT}/${paymentInitiation.paymentId}`, {
              reference
            });
            
            toast({
              title: "Payment Successful",
              description: "You now have access to the landlord's contact information.",
            });
            
            if (onSuccess) {
              onSuccess();
            }
            
            onClose();
          } catch (error) {
            console.error("Error verifying payment:", error);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if your payment was deducted.",
              variant: "destructive",
            });
          }
        },
        () => {
          // Payment cancelled
          setProcessingPayment(false);
          toast({
            title: "Payment Cancelled",
            description: "You can try again later.",
          });
        }
      );
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment Failed",
        description: "An error occurred while processing your payment. Please try again.",
        variant: "destructive",
      });
      setProcessingPayment(false);
    }
  };
  
  if (!open) return null;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Contact Landlord</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="py-6 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-neutral-600">Loading listing details...</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <p className="text-neutral-700">
                To view contact details and chat with this landlord, a one-time fee is required.
              </p>
              
              {listing && (
                <div className="bg-neutral-100 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{listing.title}</h4>
                  <p className="text-sm text-neutral-600 mb-2">{listing.address}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-neutral-200 overflow-hidden mr-2">
                        {owner?.avatar ? (
                          <img src={owner.avatar} alt="Landlord" className="h-full w-full object-cover" />
                        ) : (
                          <i className="fas fa-user text-neutral-400 flex items-center justify-center h-full"></i>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Landlord</p>
                        <p className="text-xs text-neutral-500">{owner?.name || "Property Owner"}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-primary font-medium">{formatPrice(listing.price)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="font-medium">Contact Fee</p>
                    <p className="text-xs text-neutral-600">One-time payment</p>
                  </div>
                  <span className="font-bold">{formatPrice(contactFee)}</span>
                </div>
                
                <div className="pt-3 border-t border-neutral-200">
                  <p className="text-xs text-neutral-500">
                    <i className="fas fa-info-circle mr-1"></i> This fee gives you access to:
                  </p>
                  <ul className="text-xs text-neutral-600 mt-1 space-y-1">
                    <li className="flex items-start">
                      <i className="fas fa-check text-primary mt-1 mr-1"></i>
                      <span>Landlord's contact information</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-primary mt-1 mr-1"></i>
                      <span>Direct messaging with landlord</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-primary mt-1 mr-1"></i>
                      <span>Property viewing coordination</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={onClose} disabled={processingPayment}>
                Cancel
              </Button>
              <Button 
                onClick={handlePayment} 
                disabled={processingPayment}
                className="bg-primary hover:bg-primary/90"
              >
                {processingPayment ? (
                  <>
                    <span className="animate-spin mr-2">
                      <i className="fas fa-spinner"></i>
                    </span>
                    Processing...
                  </>
                ) : (
                  <>Pay with Paystack</>
                )}
              </Button>
            </DialogFooter>
            
            <p className="text-xs text-neutral-500 text-center">
              By proceeding, you agree to Kribs' Terms of Service and Privacy Policy
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
