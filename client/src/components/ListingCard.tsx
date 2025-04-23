import React from 'react';
import { useLocation } from 'wouter';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  BedDouble, 
  Bath, 
  ArrowRightCircle, 
  Star, 
  MapPin, 
  SquareIcon 
} from 'lucide-react';
import { formatPrice, formatDate } from '../lib/utils';
import { cn } from '../lib/utils';

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
  
  // Handle click on the card
  const handleClick = () => {
    if (onCardClick) {
      onCardClick(id);
    } else {
      navigate(`/listings/${id}`);
    }
  };
  
  // Default image if no photos provided
  const mainPhoto = photos && photos.length > 0 
    ? photos[0] 
    : 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&auto=format&fit=crop';
  
  // Format the date
  const formattedDate = formatDate(createdAt);
  
  return (
    <Card 
      className={cn(
        "overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md",
        size === "small" && "max-w-[250px]",
        size === "large" && "max-w-[350px]",
        size === "horizontal" && "max-w-full"
      )}
      onClick={handleClick}
    >
      <div className={cn(
        "relative",
        size === "horizontal" ? "flex" : "flex-col"
      )}>
        {/* Property image */}
        <div className={cn(
          "relative overflow-hidden",
          size === "small" && "h-[150px]",
          size === "large" && "h-[200px]",
          size === "horizontal" && "h-[200px] w-[200px] flex-shrink-0"
        )}>
          <img 
            src={mainPhoto}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          
          {/* Featured badge */}
          {featured && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-yellow-400 text-black hover:bg-yellow-500">
                <Star className="w-3 h-3 mr-1" /> Featured
              </Badge>
            </div>
          )}
          
          {/* Property type badge */}
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-black/60 text-white border-none">
              {type}
            </Badge>
          </div>
        </div>
        
        {/* Property details */}
        <div className={cn(
          "p-4 flex flex-col",
          size === "horizontal" && "flex-1"
        )}>
          {/* Title */}
          <h3 className={cn(
            "font-semibold line-clamp-2 mb-1",
            size === "small" ? "text-sm" : "text-base"
          )}>
            {title}
          </h3>
          
          {/* Location */}
          <div className="flex items-center text-neutral-500 mb-2">
            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className={cn(
              "truncate",
              size === "small" ? "text-xs" : "text-sm"
            )}>
              {address}
            </span>
          </div>
          
          {/* Price */}
          <div className="text-primary font-bold mb-3">
            {formatPrice(price)}
            <span className="text-neutral-500 font-normal text-sm"> / month</span>
          </div>
          
          {/* Features */}
          <div className={cn(
            "flex items-center space-x-3 text-sm text-neutral-600 mt-auto",
            size === "small" && "text-xs"
          )}>
            {bedrooms !== undefined && (
              <div className="flex items-center">
                <BedDouble className="w-4 h-4 mr-1 text-neutral-400" />
                <span>{bedrooms}</span>
              </div>
            )}
            
            {bathrooms !== undefined && (
              <div className="flex items-center">
                <Bath className="w-4 h-4 mr-1 text-neutral-400" />
                <span>{bathrooms}</span>
              </div>
            )}
            
            {squareMeters !== undefined && (
              <div className="flex items-center">
                <SquareIcon className="w-4 h-4 mr-1 text-neutral-400" />
                <span>{squareMeters} m²</span>
              </div>
            )}
          </div>
          
          {/* View button (shown only on horizontal cards or on hover) */}
          {size === "horizontal" && (
            <div className="mt-4">
              <Button size="sm" className="w-full sm:w-auto">
                View Details <ArrowRightCircle className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ListingCard;