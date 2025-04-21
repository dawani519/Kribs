import { formatPrice, formatRelativeTime } from "@/lib/utils";
import { Link } from "wouter";
import { ROUTES } from "@/config/constants";

interface Amenity {
  id: number;
  listingId: number;
  name: string;
}

interface ListingCardProps {
  id: number;
  title: string;
  type: string;
  address: string;
  price: number;
  photos: string[];
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
  featured?: boolean;
  createdAt: string;
  size?: "small" | "large" | "horizontal";
  onCardClick?: (id: number) => void;
}

const ListingCard = ({
  id,
  title,
  type,
  address,
  price,
  photos,
  bedrooms,
  bathrooms,
  squareMeters,
  featured = false,
  createdAt,
  size = "large",
  onCardClick
}: ListingCardProps) => {
  
  const handleClick = () => {
    if (onCardClick) {
      onCardClick(id);
    }
  };
  
  // Default image if photos array is empty
  const photoUrl = photos && photos.length > 0 
    ? photos[0] 
    : 'https://via.placeholder.com/500x300?text=No+Image';
  
  // Checking if it's a new listing (less than 3 days old)
  const isNew = () => {
    const now = new Date();
    const listingDate = new Date(createdAt);
    const diffTime = Math.abs(now.getTime() - listingDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };
  
  if (size === "small") {
    return (
      <div 
        onClick={handleClick}
        className="property-card bg-white rounded-xl overflow-hidden shadow-sm h-full cursor-pointer transition-transform hover:scale-[1.02]"
      >
        <div className="relative">
          <img src={photoUrl} alt={title} className="w-full h-28 object-cover" />
          {isNew() && (
            <div className="absolute top-2 left-2">
              <span className="bg-warning text-white text-xs font-medium px-2 py-0.5 rounded">New</span>
            </div>
          )}
        </div>
        <div className="p-2">
          <h3 className="font-medium text-sm">{title}</h3>
          <p className="text-xs text-neutral-600 truncate">{address}</p>
          <div className="flex justify-between items-center mt-1">
            <span className="font-medium text-primary text-sm">{formatPrice(price)}</span>
            <div className="flex space-x-2 text-xs text-neutral-600">
              {bedrooms !== undefined && (
                <span className="flex items-center"><i className="fas fa-bed mr-1"></i> {bedrooms}</span>
              )}
              {bathrooms !== undefined && (
                <span className="flex items-center"><i className="fas fa-bath mr-1"></i> {bathrooms}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (size === "horizontal") {
    return (
      <div 
        onClick={handleClick}
        className="property-card bg-white rounded-xl overflow-hidden shadow-sm flex cursor-pointer transition-transform hover:scale-[1.02]"
      >
        <div className="w-24 h-24 flex-shrink-0">
          <img src={photoUrl} alt={title} className="w-full h-full object-cover" />
        </div>
        <div className="p-2 flex-1">
          <h3 className="font-medium text-sm">{title}</h3>
          <p className="text-xs text-neutral-600 truncate">{address}</p>
          <div className="flex justify-between items-center mt-1">
            <span className="font-medium text-primary text-sm">{formatPrice(price)}</span>
            <span className="text-xs text-neutral-600 flex items-center">
              <i className="fas fa-map-marker-alt mr-1"></i> 1.2 km
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  // Default large card
  return (
    <div 
      onClick={handleClick}
      className="property-card bg-white rounded-xl overflow-hidden shadow-sm mb-4 cursor-pointer transition-transform hover:scale-[1.02]"
    >
      <div className="relative">
        <img src={photoUrl} alt={title} className="w-full h-48 object-cover" />
        {featured && (
          <div className="absolute top-3 left-3">
            <span className="bg-primary text-white text-xs font-medium px-2 py-1 rounded">Featured</span>
          </div>
        )}
        <div className="absolute bottom-3 right-3 flex space-x-2">
          <span className="bg-black bg-opacity-60 text-white text-xs font-medium px-2 py-1 rounded flex items-center">
            <i className="fas fa-image mr-1"></i> {photos ? photos.length : 0}
          </span>
        </div>
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold">{title}</h3>
          <span className="font-semibold text-primary">{formatPrice(price)}</span>
        </div>
        <p className="text-sm text-neutral-600 mt-1">{address}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex space-x-3 text-xs text-neutral-600">
            {bedrooms !== undefined && (
              <span className="flex items-center"><i className="fas fa-bed mr-1"></i> {bedrooms}</span>
            )}
            {bathrooms !== undefined && (
              <span className="flex items-center"><i className="fas fa-bath mr-1"></i> {bathrooms}</span>
            )}
            {squareMeters !== undefined && (
              <span className="flex items-center"><i className="fas fa-vector-square mr-1"></i> {squareMeters}m²</span>
            )}
          </div>
          <button className="text-xs bg-secondary bg-opacity-10 text-secondary font-medium px-2 py-1 rounded">
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
