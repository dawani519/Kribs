import React from 'react';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { FaBed, FaBath, FaSquare, FaStar } from 'react-icons/fa';
import { IoBusiness } from 'react-icons/io5';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter } from './ui/card';

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

/**
 * ListingCard component - displays a property listing in a card format
 */
const ListingCard: React.FC<ListingCardProps> = ({
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
  onCardClick,
}: ListingCardProps) => {
  const [, navigate] = useLocation();
  
  // Format listing time
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  
  // Format price with commas for thousands
  const formattedPrice = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  // Handle card click
  const handleClick = () => {
    if (onCardClick) {
      onCardClick(id);
    } else {
      navigate(`/listings/${id}`);
    }
  };
  
  // Render horizontal layout
  if (size === "horizontal") {
    return (
      <Card 
        className="overflow-hidden border border-neutral-200 hover:border-primary/50 transition-colors cursor-pointer mb-4 flex h-40 flex-row"
        onClick={handleClick}
      >
        <div 
          className="relative h-full w-1/3 bg-neutral-100"
          style={{ 
            backgroundImage: photos && photos.length > 0 ? `url(${photos[0]})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {photos && photos.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
              <IoBusiness size={32} />
            </div>
          )}
          
          {featured && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-500 text-white flex items-center gap-1">
              <FaStar size={12} />
              <span>Featured</span>
            </Badge>
          )}
          
          <Badge className="absolute bottom-2 left-2 bg-black/60 text-white hover:bg-black/60">
            {type === 'rent' ? 'For Rent' : type === 'sale' ? 'For Sale' : 'Short Stay'}
          </Badge>
        </div>
        
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-lg text-neutral-800 mb-1 line-clamp-1">{title}</h3>
            <p className="text-neutral-500 text-sm mb-2 line-clamp-1">{address}</p>
            
            <div className="flex items-center gap-3 text-sm text-neutral-600">
              {bedrooms !== undefined && (
                <div className="flex items-center gap-1">
                  <FaBed />
                  <span>{bedrooms}</span>
                </div>
              )}
              
              {bathrooms !== undefined && (
                <div className="flex items-center gap-1">
                  <FaBath />
                  <span>{bathrooms}</span>
                </div>
              )}
              
              {squareMeters !== undefined && (
                <div className="flex items-center gap-1">
                  <FaSquare />
                  <span>{squareMeters} m²</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <div className="text-primary font-semibold">₦{formattedPrice}</div>
            <div className="text-xs text-neutral-400">{timeAgo}</div>
          </div>
        </div>
      </Card>
    );
  }
  
  // Render small or large card
  return (
    <Card 
      className="overflow-hidden border border-neutral-200 hover:border-primary/50 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div 
        className={`relative w-full ${size === "small" ? "h-40" : "h-48"} bg-neutral-100`}
        style={{ 
          backgroundImage: photos && photos.length > 0 ? `url(${photos[0]})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {photos && photos.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
            <IoBusiness size={32} />
          </div>
        )}
        
        {featured && (
          <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-500 text-white flex items-center gap-1">
            <FaStar size={12} />
            <span>Featured</span>
          </Badge>
        )}
        
        <Badge className="absolute bottom-2 left-2 bg-black/60 text-white hover:bg-black/60">
          {type === 'rent' ? 'For Rent' : type === 'sale' ? 'For Sale' : 'Short Stay'}
        </Badge>
      </div>
      
      <CardContent className={`pt-4 ${size === "small" ? "pb-2 px-3" : "pb-3 px-4"}`}>
        <h3 className={`font-medium ${size === "small" ? "text-base" : "text-lg"} text-neutral-800 mb-1 line-clamp-1`}>
          {title}
        </h3>
        <p className="text-neutral-500 text-sm mb-2 line-clamp-1">{address}</p>
        
        <div className="flex items-center gap-3 text-sm text-neutral-600">
          {bedrooms !== undefined && (
            <div className="flex items-center gap-1">
              <FaBed />
              <span>{bedrooms}</span>
            </div>
          )}
          
          {bathrooms !== undefined && (
            <div className="flex items-center gap-1">
              <FaBath />
              <span>{bathrooms}</span>
            </div>
          )}
          
          {squareMeters !== undefined && (
            <div className="flex items-center gap-1">
              <FaSquare />
              <span>{squareMeters} m²</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className={`flex justify-between items-center pt-0 ${size === "small" ? "pb-3 px-3" : "pb-4 px-4"} border-t border-neutral-100`}>
        <div className="text-primary font-semibold">₦{formattedPrice}</div>
        <div className="text-xs text-neutral-400">{timeAgo}</div>
      </CardFooter>
    </Card>
  );
};

export default ListingCard;