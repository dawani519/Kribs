import React, { ReactNode } from 'react';
import ListingCard from './ListingCard';
import { FaSearch } from 'react-icons/fa';
import { RiFileListLine } from 'react-icons/ri';

interface ListingGridProps {
  listings: Array<{
    id: number;
    title: string;
    type: string;
    city: string;
    state: string;
    price: number;
    photos: string[];
    bedrooms?: number;
    bathrooms?: number;
    squareMeters?: number;
    featured?: boolean;
    createdAt: string;
  }>;
  columns?: 1 | 2 | 3;
  size?: "small" | "large" | "horizontal";
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
}

/**
 * ListingGrid component - displays a grid of property listings
 */
const ListingGrid: React.FC<ListingGridProps> = ({
  listings,
  columns = 2,
  size = "large",
  loading = false,
  emptyMessage = "No listings found",
  emptyIcon,
}: ListingGridProps) => {
  // Generate grid columns CSS class
  const gridColumnsClass = 
    columns === 1 
      ? 'grid-cols-1' 
      : columns === 3 
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2';
  
  // Loading state
  if (loading) {
    // Create skeleton cards
    return (
      <div className={`grid gap-4 ${gridColumnsClass}`}>
        {Array.from({ length: columns * 2 }).map((_, index) => (
          <div 
            key={index}
            className="rounded-lg border border-neutral-200 overflow-hidden animate-pulse"
          >
            <div className={`${size === "small" ? "h-40" : "h-48"} bg-neutral-100`}></div>
            <div className="p-4 space-y-3">
              <div className="h-5 bg-neutral-100 rounded w-3/4"></div>
              <div className="h-4 bg-neutral-100 rounded w-full"></div>
              <div className="flex gap-3">
                <div className="h-4 bg-neutral-100 rounded w-12"></div>
                <div className="h-4 bg-neutral-100 rounded w-12"></div>
              </div>
              <div className="flex justify-between pt-2">
                <div className="h-5 bg-neutral-100 rounded w-20"></div>
                <div className="h-3 bg-neutral-100 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Empty state
  if (!listings || listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4 text-neutral-400">
          {emptyIcon || <FaSearch size={24} />}
        </div>
        <h3 className="text-lg font-medium text-neutral-800 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-neutral-500 max-w-md">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }
  
  // Horizontal layout
  if (size === "horizontal") {
    return (
      <div className="space-y-4">
        {listings.map(listing => (
          <ListingCard
            key={listing.id}
            id={listing.id}
            title={listing.title}
            type={listing.type}
            address={`${listing.city}, ${listing.state}`}
            price={listing.price}
            photos={listing.photos}
            bedrooms={listing.bedrooms}
            bathrooms={listing.bathrooms}
            squareMeters={listing.squareMeters}
            featured={listing.featured}
            createdAt={listing.createdAt}
            size="horizontal"
          />
        ))}
      </div>
    );
  }
  
  // Grid layout
  return (
    <div className={`grid gap-4 ${gridColumnsClass}`}>
      {listings.map(listing => (
        <ListingCard
          key={listing.id}
          id={listing.id}
          title={listing.title}
          type={listing.type}
          address={`${listing.city}, ${listing.state}`}
          price={listing.price}
          photos={listing.photos}
          bedrooms={listing.bedrooms}
          bathrooms={listing.bathrooms}
          squareMeters={listing.squareMeters}
          featured={listing.featured}
          createdAt={listing.createdAt}
          size={size}
        />
      ))}
    </div>
  );
};

export default ListingGrid;