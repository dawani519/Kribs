import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, ROUTES } from "@/config/constants";
import { formatPrice, censorPhoneNumbers } from "@/lib/utils";
import MapPicker from "@/components/MapPicker";
import PaymentModal from "@/components/PaymentModal";
import listingService from "@/services/listing-service";
import chatService from "@/services/chat-service";
import { Button } from "@/components/ui/button";

interface ListingDetailProps {
  id: string;
}

const ListingDetail = ({ id }: ListingDetailProps) => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Fetch listing details
  const { 
    data: listing, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: [`${API_ENDPOINTS.LISTINGS}/${id}`],
    queryFn: async () => {
      const response = await listingService.getListing(Number(id));
      return response;
    },
  });
  
  // Check if current user has contact access
  const { 
    data: contactAccess,
    isLoading: loadingAccess
  } = useQuery({
    queryKey: [`${API_ENDPOINTS.CONTACT_ACCESS}/${id}`],
    queryFn: async () => {
      const response = await fetch(`${API_ENDPOINTS.CONTACT_ACCESS}/${id}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to check access status');
      }
      return response.json();
    },
    enabled: !!user,
  });
  
  // Handle back button
  const handleBack = () => {
    navigate(ROUTES.HOME);
  };
  
  // Handle photo navigation
  const nextPhoto = () => {
    if (listing && listing.photos.length > 0) {
      setCurrentPhotoIndex((prev) => 
        prev === listing.photos.length - 1 ? 0 : prev + 1
      );
    }
  };
  
  const prevPhoto = () => {
    if (listing && listing.photos.length > 0) {
      setCurrentPhotoIndex((prev) => 
        prev === 0 ? listing.photos.length - 1 : prev - 1
      );
    }
  };
  
  // Handle favorites toggle
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite 
        ? "This property has been removed from your favorites" 
        : "This property has been added to your favorites",
    });
  };
  
  // Handle contact button click
  const handleContactButton = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to contact the landlord",
        variant: "destructive",
      });
      navigate(ROUTES.LOGIN);
      return;
    }
    
    // If user already has access, start chat
    if (contactAccess?.hasAccess) {
      startChat();
    } else {
      // Otherwise show payment modal
      setShowPaymentModal(true);
    }
  };
  
  // Start chat with property owner
  const startChat = async () => {
    if (!user || !listing) return;
    
    try {
      // Create or get conversation
      const conversation = await chatService.createConversation({
        listingId: listing.id,
        ownerId: listing.userId
      });
      
      // Navigate to chat screen
      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({
        title: "Failed to start chat",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };
  
  // Handle payment success
  const handlePaymentSuccess = () => {
    // Refetch access status
    queryClient.invalidateQueries({
      queryKey: [`${API_ENDPOINTS.CONTACT_ACCESS}/${id}`],
    });
    
    // Refresh listing details to show contact info
    queryClient.invalidateQueries({
      queryKey: [`${API_ENDPOINTS.LISTINGS}/${id}`],
    });
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-neutral-600">Loading property details...</p>
      </div>
    );
  }
  
  // Error state
  if (error || !listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-center mb-4">
          <i className="fas fa-exclamation-circle text-3xl"></i>
          <p className="mt-2">Failed to load property details</p>
        </div>
        <Button onClick={handleBack}>Go Back</Button>
      </div>
    );
  }
  
  // Current photo URL
  const currentPhotoUrl = listing.photos && listing.photos.length > 0
    ? listing.photos[currentPhotoIndex]
    : 'https://via.placeholder.com/800x600?text=No+Image';
  
  // Determine if contact info should be shown
  const hasContactAccess = contactAccess?.hasAccess;
  
  // Owner phone (censored if no access)
  const ownerPhone = "+234 801 234 5678"; // In a real app, this would come from the API
  const displayPhone = hasContactAccess ? ownerPhone : "+234 80** *** ***";
  
  // Truncate description if needed
  const shortDescription = listing.description.length > 150
    ? `${listing.description.substring(0, 150)}...`
    : listing.description;
  
  return (
    <div className="bg-white min-h-screen">
      {/* Image Gallery */}
      <div className="relative h-64 bg-neutral-200">
        <img 
          src={currentPhotoUrl} 
          alt={listing.title} 
          className="w-full h-full object-cover"
        />
        <button 
          onClick={handleBack}
          className="absolute top-4 left-4 h-8 w-8 rounded-full bg-black bg-opacity-50 flex items-center justify-center"
        >
          <i className="fas fa-arrow-left text-white"></i>
        </button>
        
        {/* Photo navigation */}
        {listing.photos && listing.photos.length > 1 && (
          <>
            <button 
              onClick={prevPhoto}
              className="absolute top-1/2 left-2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-black bg-opacity-50 flex items-center justify-center"
            >
              <i className="fas fa-chevron-left text-white"></i>
            </button>
            <button 
              onClick={nextPhoto}
              className="absolute top-1/2 right-2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-black bg-opacity-50 flex items-center justify-center"
            >
              <i className="fas fa-chevron-right text-white"></i>
            </button>
          </>
        )}
        
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <span className="bg-black bg-opacity-60 text-white text-xs font-medium px-2 py-1 rounded flex items-center">
            <i className="fas fa-image mr-1"></i> 
            {currentPhotoIndex + 1}/{listing.photos?.length || 1}
          </span>
          {listing.photos && listing.photos.length > 1 && (
            <button 
              onClick={() => setShowAllPhotos(true)}
              className="bg-black bg-opacity-60 text-white text-xs font-medium px-2 py-1 rounded"
            >
              View All
            </button>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-semibold">{listing.title}</h2>
          <button 
            onClick={toggleFavorite}
            className="h-8 w-8 rounded-full border border-neutral-200 flex items-center justify-center"
          >
            <i className={`${isFavorite ? 'fas text-red-500' : 'far text-neutral-500'} fa-heart`}></i>
          </button>
        </div>
        
        <p className="text-neutral-600 mb-3">{listing.address}</p>
        
        <div className="flex items-center justify-between mt-3 mb-4">
          <span className="font-bold text-xl text-primary">{formatPrice(listing.price)}</span>
          <div className="flex items-center text-sm text-neutral-600">
            <i className="fas fa-clock mr-1"></i> Posted {new Date(listing.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        <div className="flex space-x-4 py-3 border-t border-b border-neutral-200 mb-4">
          {listing.bedrooms !== undefined && (
            <div className="flex flex-col items-center">
              <i className="fas fa-bed text-neutral-500 mb-1"></i>
              <span className="text-sm">{listing.bedrooms} Beds</span>
            </div>
          )}
          {listing.bathrooms !== undefined && (
            <div className="flex flex-col items-center">
              <i className="fas fa-bath text-neutral-500 mb-1"></i>
              <span className="text-sm">{listing.bathrooms} Baths</span>
            </div>
          )}
          {listing.squareMeters !== undefined && (
            <div className="flex flex-col items-center">
              <i className="fas fa-vector-square text-neutral-500 mb-1"></i>
              <span className="text-sm">{listing.squareMeters}m²</span>
            </div>
          )}
          <div className="flex flex-col items-center">
            <i className="fas fa-calendar-alt text-neutral-500 mb-1"></i>
            <span className="text-sm">
              {listing.availableFrom 
                ? new Date(listing.availableFrom).toLocaleDateString() 
                : 'Available Now'}
            </span>
          </div>
        </div>
        
        {/* Description */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-neutral-700 text-sm">
            {showFullDescription ? listing.description : shortDescription}
          </p>
          {listing.description.length > 150 && (
            <button 
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-primary text-sm font-medium mt-2"
            >
              {showFullDescription ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
        
        {/* Amenities */}
        {listing.amenities && listing.amenities.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Amenities</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              {listing.amenities.map((amenity: any) => (
                <div key={amenity.id} className="flex items-center">
                  <i className="fas fa-check text-primary mr-2 text-xs"></i>
                  <span>{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Location */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Location</h3>
          <div className="bg-neutral-100 h-40 rounded-lg mb-2 relative overflow-hidden">
            {(listing.latitude && listing.longitude) ? (
              <MapPicker
                initialCoordinates={{ 
                  lat: listing.latitude, 
                  lng: listing.longitude 
                }}
                initialAddress={listing.address}
                height="160px"
                readOnly={true}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-map-marker-alt text-primary text-3xl mb-2"></i>
                  <p className="text-sm text-neutral-700">Location not available</p>
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-neutral-600">{listing.address}</p>
        </div>
        
        {/* Landlord Info */}
        <div className="bg-neutral-100 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-neutral-200 overflow-hidden mr-3">
                <i className="fas fa-user flex items-center justify-center h-full text-neutral-400"></i>
              </div>
              <div>
                <h4 className="font-medium">Listed by {listing.userId === user?.id ? 'You' : 'Landlord'}</h4>
                <p className="text-sm text-neutral-600">
                  {listing.userId === user?.id ? `${user.firstName} ${user.lastName}` : 'Property Owner'}
                </p>
              </div>
            </div>
            {listing.verified && (
              <div>
                <span className="flex items-center text-sm text-success">
                  <i className="fas fa-check-circle mr-1"></i> Verified
                </span>
              </div>
            )}
          </div>
          {!hasContactAccess && listing.userId !== user?.id && (
            <div className="mt-3 pt-3 border-t border-neutral-200">
              <p className="text-sm">
                <i className="fas fa-phone mr-2"></i> Contact: <span className="font-medium">{displayPhone}</span>
              </p>
              <p className="text-xs text-neutral-500 mt-1">Contact information is hidden until payment</p>
            </div>
          )}
          {hasContactAccess && listing.userId !== user?.id && (
            <div className="mt-3 pt-3 border-t border-neutral-200">
              <p className="text-sm">
                <i className="fas fa-phone mr-2"></i> Contact: <span className="font-medium">{displayPhone}</span>
              </p>
              <Button
                onClick={startChat}
                variant="outline"
                size="sm"
                className="mt-2 w-full"
              >
                <i className="fas fa-comment mr-2"></i> Message Landlord
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Fixed Contact Button */}
      {listing.userId !== user?.id && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-200">
          <Button
            onClick={handleContactButton}
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isLoading || loadingAccess}
          >
            {hasContactAccess ? (
              <>Message Landlord</>
            ) : (
              <>Contact Landlord - ₦5,000</>
            )}
          </Button>
        </div>
      )}
      
      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        listingId={Number(id)}
        onSuccess={handlePaymentSuccess}
      />
      
      {/* Photo Gallery Modal - would be implemented in a real app */}
      {showAllPhotos && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="p-4 flex justify-between items-center">
            <button 
              onClick={() => setShowAllPhotos(false)}
              className="text-white"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
            <span className="text-white text-sm">
              {currentPhotoIndex + 1}/{listing.photos?.length || 1}
            </span>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <img 
              src={currentPhotoUrl} 
              alt={listing.title} 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          <div className="p-4 flex justify-between">
            <button 
              onClick={prevPhoto}
              className="text-white"
            >
              <i className="fas fa-chevron-left text-xl"></i>
            </button>
            <button 
              onClick={nextPhoto}
              className="text-white"
            >
              <i className="fas fa-chevron-right text-xl"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;
