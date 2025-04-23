import React from 'react';
import { Loader2 } from 'lucide-react';
import ListingCard from './ListingCard';
import { Listing } from '../types';
import { cn } from '../lib/utils';

interface ListingGridProps {
  listings: Listing[];
  columns?: 1 | 2 | 3;
  size?: "small" | "large" | "horizontal";
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

/**
 * ListingGrid component - displays a grid of property listings
 */
const ListingGrid: React.FC<ListingGridProps> = ({
  listings,
  columns = 3,
  size = "large",
  loading = false,
  emptyMessage = "No properties found",
  emptyIcon,
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Empty state
  if (!listings || listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        {emptyIcon && (
          <div className="mb-4 text-neutral-400">
            {emptyIcon}
          </div>
        )}
        <h3 className="text-xl font-semibold mb-2">No Results</h3>
        <p className="text-neutral-500">{emptyMessage}</p>
      </div>
    );
  }
  
  // Determine grid columns based on prop and responsive design
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  };
  
  // If size is horizontal, always use 1 column
  const actualColumns = size === "horizontal" ? 1 : columns;
  
  return (
    <div className={cn(
      "grid gap-4 sm:gap-6",
      size === "horizontal" ? "grid-cols-1" : gridCols[actualColumns]
    )}>
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          id={listing.id}
          title={listing.title}
          type={listing.type}
          address={listing.address}
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