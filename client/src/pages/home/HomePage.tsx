import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'wouter';
import { AppDispatch, RootState } from '../../redux/store';
import { ROUTES } from '../../config/constants';
import { APP_NAME } from '../../config/constants';
import ListingGrid from '../../components/ListingGrid';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Listing } from '../../types';

const HomePage: React.FC = () => {
  const [, navigate] = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.listings);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  
  useEffect(() => {
    // In a real implementation, we would dispatch an action to fetch featured listings
    // For now, we'll use a timeout to simulate an API call
    const timer = setTimeout(() => {
      setFeaturedListings([
        {
          id: 1,
          userId: 1,
          title: "Modern 3 Bedroom Apartment",
          description: "Beautiful apartment with a great view",
          type: "rent",
          category: "apartment",
          price: 350000,
          address: "14 Admiralty Way",
          city: "Lekki",
          state: "Lagos",
          latitude: 6.4281,
          longitude: 3.4219,
          bedrooms: 3,
          bathrooms: 2,
          squareMeters: 120,
          photos: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60"
          ],
          amenities: ["Air Conditioning", "Wifi", "Parking"],
          featured: true,
          approved: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          userId: 2,
          title: "Luxury Villa with Pool",
          description: "Spacious villa with private pool and garden",
          type: "sale",
          category: "house",
          price: 75000000,
          address: "5 Banana Island Road",
          city: "Ikoyi",
          state: "Lagos",
          latitude: 6.4548,
          longitude: 3.4737,
          bedrooms: 5,
          bathrooms: 6,
          squareMeters: 450,
          photos: [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aG91c2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60"
          ],
          amenities: ["Pool", "Garden", "Security", "Air Conditioning"],
          featured: true,
          approved: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 3,
          userId: 3,
          title: "Office Space in Victoria Island",
          description: "Prime office location with modern amenities",
          type: "rent",
          category: "commercial",
          price: 850000,
          address: "23 Kofo Abayomi Street",
          city: "Victoria Island",
          state: "Lagos",
          latitude: 6.4271,
          longitude: 3.4207,
          squareMeters: 200,
          photos: [
            "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8b2ZmaWNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60"
          ],
          amenities: ["Elevator", "24/7 Power", "Security", "Parking"],
          featured: true,
          approved: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);
  
  const handleCreateListing = () => {
    navigate(ROUTES.CREATE_LISTING);
  };
  
  const handleSearch = () => {
    navigate(ROUTES.SEARCH);
  };
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/80 to-primary rounded-xl p-6 md:p-8 text-white">
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold mb-4">Find Your Perfect Home</h1>
          <p className="mb-6 opacity-90">
            Browse thousands of properties for rent, sale, or short stay across Nigeria
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="secondary" size="lg" onClick={handleSearch} className="flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Properties
            </Button>
            <Button variant="outline" size="lg" onClick={handleCreateListing} className="bg-white hover:bg-white/90 flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              List Your Property
            </Button>
          </div>
        </div>
      </section>
      
      {/* Featured Properties */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Featured Properties</h2>
          <Button variant="link" onClick={handleSearch} className="text-primary">
            View all
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg overflow-hidden border border-neutral-200">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="pt-2 flex justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ListingGrid 
            listings={featuredListings} 
            columns={3} 
            size="large" 
            emptyMessage="No featured properties available"
          />
        )}
      </section>
      
      {/* Property Types */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Browse by Property Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Apartments', 'Houses', 'Land', 'Commercial'].map((type) => (
            <div 
              key={type} 
              className="bg-white border border-neutral-200 rounded-lg p-4 text-center cursor-pointer hover:border-primary hover:shadow-md transition-all"
              onClick={handleSearch}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-medium">{type}</h3>
            </div>
          ))}
        </div>
      </section>
      
      {/* How It Works */}
      <section className="bg-neutral-50 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6 text-center">How {APP_NAME} Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="font-medium mb-2">Search Properties</h3>
            <p className="text-neutral-600 text-sm">
              Browse our extensive listings filtered by your preferences
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 className="font-medium mb-2">Contact Owners</h3>
            <p className="text-neutral-600 text-sm">
              Connect directly with property owners or agents via our platform
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="font-medium mb-2">List Your Property</h3>
            <p className="text-neutral-600 text-sm">
              Easily list your own property for rent, sale, or short stay
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;