import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useGeoLocation } from "@/hooks/use-geo-location";
import { API_ENDPOINTS, ROUTES } from "@/config/constants";
import ListingCard from "@/components/ListingCard";
import ListingGrid from "@/components/ListingGrid";
import SearchFilterBar from "@/components/SearchFilterBar";
import MapPicker from "@/components/MapPicker";
import { Button } from "@/components/ui/button";
import listingService from "@/services/listing-service";

interface Filter {
  type?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  nearMe?: boolean;
}

const HomeScreen = () => {
  const [, navigate] = useLocation();
  const { coordinates, error: geoError } = useGeoLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filter>({});
  const [showFullMap, setShowFullMap] = useState(false);
  
  // Fetch featured listings
  const { data: featuredListings = [], isLoading: loadingFeatured } = useQuery({
    queryKey: [API_ENDPOINTS.FEATURED_LISTINGS],
    queryFn: async () => {
      const response = await listingService.getFeaturedListings();
      return response;
    },
  });
  
  // Fetch recent listings
  const { data: recentListings = [], isLoading: loadingRecent } = useQuery({
    queryKey: [API_ENDPOINTS.RECENT_LISTINGS],
    queryFn: async () => {
      const response = await listingService.getRecentListings();
      return response;
    },
  });
  
  // Fetch nearby listings when coordinates change
  const { 
    data: nearbyListings = [], 
    isLoading: loadingNearby,
    refetch: refetchNearby
  } = useQuery({
    queryKey: [API_ENDPOINTS.NEARBY_LISTINGS, coordinates?.lat, coordinates?.lng],
    queryFn: async () => {
      if (!coordinates) return [];
      const response = await listingService.getNearbyListings(
        coordinates.lat,
        coordinates.lng
      );
      return response;
    },
    enabled: !!coordinates,
  });
  
  useEffect(() => {
    if (coordinates) {
      refetchNearby();
    }
  }, [coordinates, refetchNearby]);
  
  // Handle search query
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, this would trigger a search API call
    // For now, we're just setting the state
  };
  
  // Handle filters
  const handleFilter = (newFilters: Filter) => {
    setFilters(newFilters);
    // In a real app, this would trigger a filtered API call
    // For now, we're just setting the state
  };
  
  // Handle card click
  const handleCardClick = (id: number) => {
    navigate(ROUTES.LISTING_DETAIL.replace(':id', id.toString()));
  };
  
  // Toggle full map view
  const toggleMapView = () => {
    setShowFullMap(!showFullMap);
  };
  
  return (
    <div className="pb-20">
      {/* Search and Filter Bar */}
      <SearchFilterBar
        onSearch={handleSearch}
        onFilter={handleFilter}
        initialQuery={searchQuery}
        initialFilters={filters}
      />
      
      {/* Full Map View when toggled */}
      {showFullMap && (
        <div className="px-4 mb-6">
          <div className="relative h-[400px] mb-3">
            <MapPicker
              initialCoordinates={coordinates || undefined}
              height="400px"
              readOnly={true}
            />
            <button 
              onClick={toggleMapView}
              className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <h2 className="text-lg font-semibold mb-3">Properties Near You</h2>
          <div className="space-y-3">
            {loadingNearby ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-neutral-500">Loading properties...</p>
              </div>
            ) : nearbyListings.length === 0 ? (
              <div className="text-center py-4">
                <i className="fas fa-map-marker-alt text-neutral-300 text-3xl mb-2"></i>
                <p className="text-neutral-500">No properties found nearby</p>
              </div>
            ) : (
              nearbyListings.map((listing: any) => (
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
              ))
            )}
          </div>
        </div>
      )}
      
      {/* Main content when map is not toggled */}
      {!showFullMap && (
        <>
          {/* Featured Listings */}
          <div className="px-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">Featured Listings</h2>
            {loadingFeatured ? (
              <div className="space-y-4">
                <div className="animate-pulse bg-neutral-200 h-48 rounded-xl"></div>
                <div className="animate-pulse bg-neutral-200 h-48 rounded-xl"></div>
              </div>
            ) : featuredListings.length === 0 ? (
              <div className="text-center py-6">
                <i className="fas fa-home text-neutral-300 text-3xl mb-2"></i>
                <p className="text-neutral-500">No featured listings available</p>
              </div>
            ) : (
              featuredListings.map((listing: any) => (
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
                  featured={true}
                  createdAt={listing.createdAt}
                  onCardClick={handleCardClick}
                />
              ))
            )}
          </div>
          
          {/* Recently Added */}
          <div className="px-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">Recently Added</h2>
            <ListingGrid
              listings={recentListings}
              columns={2}
              size="small"
              loading={loadingRecent}
              emptyMessage="No recent listings found"
            />
          </div>
          
          {/* Near You */}
          <div className="px-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Near You</h2>
              <Button 
                onClick={toggleMapView}
                variant="link" 
                className="text-primary p-0 h-auto"
              >
                View Map
              </Button>
            </div>
            
            {/* Map Preview */}
            <div className="relative bg-neutral-200 h-40 rounded-xl overflow-hidden mb-3">
              {coordinates ? (
                <MapPicker
                  initialCoordinates={coordinates}
                  height="160px"
                  readOnly={true}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <i className="fas fa-map-marker-alt text-primary text-3xl mb-2"></i>
                    <p className="text-sm text-neutral-700">
                      {geoError ? "Location access denied" : "Getting your location..."}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Nearby Properties */}
            <div className="space-y-3">
              {loadingNearby ? (
                <div className="space-y-3">
                  <div className="animate-pulse bg-neutral-200 h-24 rounded-xl"></div>
                  <div className="animate-pulse bg-neutral-200 h-24 rounded-xl"></div>
                  <div className="animate-pulse bg-neutral-200 h-24 rounded-xl"></div>
                </div>
              ) : nearbyListings.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-map-marker-alt text-neutral-300 text-3xl mb-2"></i>
                  <p className="text-neutral-500">No properties found nearby</p>
                </div>
              ) : (
                nearbyListings.slice(0, 3).map((listing: any) => (
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
                    createdAt={listing.createdAt}
                    size="horizontal"
                    onCardClick={handleCardClick}
                  />
                ))
              )}
              
              {nearbyListings.length > 3 && (
                <Button 
                  onClick={toggleMapView}
                  variant="outline" 
                  className="w-full"
                >
                  View All Nearby Properties
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomeScreen;
