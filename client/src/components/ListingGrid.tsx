import React from 'react';
import { Listing } from '../types';
import ListingCard from './ListingCard';
import { Alert, AlertDescription } from './ui/alert';

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
  size = "small",
  loading = false,
  emptyMessage = "No listings found",
  emptyIcon
}: ListingGridProps) => {
  // Generate grid classes based on columns
  const gridClass = 
    columns === 1 ? "grid-cols-1" :
    columns === 2 ? "grid-cols-1 md:grid-cols-2" :
    "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  // If there are no listings and we're not loading, show empty state
  if (!loading && (!listings || listings.length === 0)) {
    return (
      <div className="py-10">
        <Alert variant="default" className="bg-neutral-50 border-neutral-200">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            {emptyIcon && <div className="mb-4">{emptyIcon}</div>}
            <AlertDescription className="text-neutral-600">{emptyMessage}</AlertDescription>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`grid ${gridClass} gap-6`}>
      {listings.map((listing) => (
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