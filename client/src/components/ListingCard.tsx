import React from 'react';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter } from './ui/card';
import { ROUTES } from '../config/constants';

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
  size = "small",
  onCardClick,
}: ListingCardProps) => {
  const [, navigate] = useLocation();
  
  // Format price with comma separators for thousands
  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price);
  
  // Format created date
  const formattedDate = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  
  // Get the first photo or use a placeholder
  const mainPhoto = photos && photos.length > 0 
    ? photos[0] 
    : 'https://via.placeholder.com/300x200?text=No+Image';
  
  // Handle card click
  const handleClick = () => {
    if (onCardClick) {
      onCardClick(id);
    } else {
      navigate(ROUTES.LISTING_DETAIL.replace(':id', id.toString()));
    }
  };
  
  // Different layouts based on size
  if (size === "horizontal") {
    return (
      <Card 
        className="overflow-hidden border cursor-pointer hover:shadow-md transition-shadow duration-200 flex flex-col sm:flex-row"
        onClick={handleClick}
      >
        {/* Image section */}
        <div className="relative h-48 sm:h-auto sm:w-1/3 overflow-hidden">
          <img 
            src={mainPhoto} 
            alt={title}
            className="object-cover w-full h-full"
          />
          {featured && (
            <Badge 
              variant="default" 
              className="absolute top-2 left-2 bg-primary text-white"
            >
              Featured
            </Badge>
          )}
          <Badge 
            variant="outline" 
            className="absolute top-2 right-2 bg-white"
          >
            {type === 'rent' ? 'For Rent' : type === 'sale' ? 'For Sale' : 'Short Stay'}
          </Badge>
        </div>
        
        {/* Content section */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1 line-clamp-2">{title}</h3>
            <p className="text-neutral-500 text-sm mb-3">{address}</p>
            
            {/* Details */}
            <div className="flex gap-3 mb-3">
              {bedrooms !== undefined && (
                <span className="text-sm text-neutral-600">
                  {bedrooms} {bedrooms === 1 ? 'Bed' : 'Beds'}
                </span>
              )}
              {bathrooms !== undefined && (
                <span className="text-sm text-neutral-600">
                  {bathrooms} {bathrooms === 1 ? 'Bath' : 'Baths'}
                </span>
              )}
              {squareMeters !== undefined && (
                <span className="text-sm text-neutral-600">
                  {squareMeters} m²
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-end justify-between mt-2">
            <div className="font-bold text-xl">{formattedPrice}</div>
            <div className="text-xs text-neutral-500">{formattedDate}</div>
          </div>
        </div>
      </Card>
    );
  }
  
  // Small and large card layouts (vertical)
  return (
    <Card 
      className={`overflow-hidden border cursor-pointer hover:shadow-md transition-shadow duration-200 flex flex-col ${size === 'large' ? 'h-full' : ''}`}
      onClick={handleClick}
    >
      {/* Image */}
      <div className={`relative ${size === 'large' ? 'h-64' : 'h-48'} overflow-hidden`}>
        <img 
          src={mainPhoto} 
          alt={title}
          className="object-cover w-full h-full"
        />
        {featured && (
          <Badge 
            variant="default" 
            className="absolute top-2 left-2 bg-primary text-white"
          >
            Featured
          </Badge>
        )}
        <Badge 
          variant="outline" 
          className="absolute top-2 right-2 bg-white"
        >
          {type === 'rent' ? 'For Rent' : type === 'sale' ? 'For Sale' : 'Short Stay'}
        </Badge>
      </div>
      
      {/* Content */}
      <CardContent className={`p-4 ${size === 'large' ? 'flex-1' : ''}`}>
        <h3 className={`${size === 'large' ? 'text-xl' : 'text-lg'} font-semibold mb-1 line-clamp-2`}>
          {title}
        </h3>
        <p className="text-neutral-500 text-sm mb-3">{address}</p>
        
        {/* Details */}
        <div className="flex gap-3 mb-3">
          {bedrooms !== undefined && (
            <span className="text-sm text-neutral-600">
              {bedrooms} {bedrooms === 1 ? 'Bed' : 'Beds'}
            </span>
          )}
          {bathrooms !== undefined && (
            <span className="text-sm text-neutral-600">
              {bathrooms} {bathrooms === 1 ? 'Bath' : 'Baths'}
            </span>
          )}
          {squareMeters !== undefined && (
            <span className="text-sm text-neutral-600">
              {squareMeters} m²
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="font-bold text-xl">{formattedPrice}</div>
        <div className="text-xs text-neutral-500">{formattedDate}</div>
      </CardFooter>
    </Card>
  );
};

export default ListingCard;