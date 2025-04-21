import { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import ListingCard from "./ListingCard";
import { ROUTES } from "@/config/constants";

interface ListingGridProps {
  listings: any[];
  columns?: 1 | 2 | 3;
  size?: "small" | "large" | "horizontal";
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
}

const ListingGrid = ({
  listings,
  columns = 2,
  size = "large",
  loading = false,
  emptyMessage = "No listings found",
  emptyIcon = <i className="fas fa-home text-neutral-300 text-5xl mb-3"></i>,
}: ListingGridProps) => {
  const [, navigate] = useLocation();

  const handleCardClick = (id: number) => {
    navigate(ROUTES.LISTING_DETAIL.replace(':id', id.toString()));
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={`grid grid-cols-${columns} gap-3`}>
        {Array.from({ length: columns * 2 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-neutral-200 h-40 rounded-xl mb-2"></div>
            <div className="bg-neutral-200 h-4 rounded-full mb-2"></div>
            <div className="bg-neutral-200 h-3 rounded-full w-2/3 mb-2"></div>
            <div className="flex justify-between">
              <div className="bg-neutral-200 h-3 rounded-full w-1/4"></div>
              <div className="bg-neutral-200 h-3 rounded-full w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-10">
        {emptyIcon}
        <p className="text-neutral-500">{emptyMessage}</p>
      </div>
    );
  }

  // Grid layout based on size and column count
  if (size === "horizontal") {
    return (
      <div className="space-y-3">
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
            size="horizontal"
            onCardClick={handleCardClick}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-${columns} gap-3`}>
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
          onCardClick={handleCardClick}
        />
      ))}
    </div>
  );
};

export default ListingGrid;
