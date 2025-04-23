import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Building, Plus, MapPin, Search, Home } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { Button } from '../../components/ui/button';
import ListingGrid from '../../components/ListingGrid';
import SearchFilterBar from '../../components/SearchFilterBar';
import { ROUTES } from '../../config/constants';
import { Listing } from '../../types';

const HomePage: React.FC = () => {
  const [, navigate] = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch featured and recent listings
  useEffect(() => {
    // For now, we'll use sample data - in a real app this would come from API
    setTimeout(() => {
      const featured = [
        {
          id: 1,
          title: 'Modern 3 Bedroom Apartment',
          type: 'Apartment',
          address: 'Lekki Phase 1, Lagos',
          price: 450000,
          photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
          bedrooms: 3,
          bathrooms: 2,
          squareMeters: 120,
          featured: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Luxury Villa with Pool',
          type: 'House',
          address: 'Victoria Island, Lagos',
          price: 850000,
          photos: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9'],
          bedrooms: 5,
          bathrooms: 4,
          squareMeters: 350,
          featured: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Office Space in Business District',
          type: 'Commercial',
          address: 'Ikoyi, Lagos',
          price: 650000,
          photos: ['https://images.unsplash.com/photo-1497366811353-6870744d04b2'],
          squareMeters: 200,
          featured: true,
          createdAt: new Date().toISOString()
        }
      ];
      
      const recent = [
        {
          id: 4,
          title: 'Cozy Studio Apartment',
          type: 'Apartment',
          address: 'Yaba, Lagos',
          price: 250000,
          photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'],
          bedrooms: 1,
          bathrooms: 1,
          squareMeters: 45,
          featured: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 5,
          title: 'Spacious 2 Bedroom Flat',
          type: 'Apartment',
          address: 'Surulere, Lagos',
          price: 350000,
          photos: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb'],
          bedrooms: 2,
          bathrooms: 2,
          squareMeters: 85,
          featured: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 6,
          title: 'Family Home with Garden',
          type: 'House',
          address: 'Ikeja, Lagos',
          price: 550000,
          photos: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750'],
          bedrooms: 4,
          bathrooms: 3,
          squareMeters: 180,
          featured: false,
          createdAt: new Date().toISOString()
        }
      ];
      
      setFeaturedListings(featured);
      setRecentListings(recent);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Handle search
  const handleSearch = (query: string) => {
    if (query) {
      console.log('Searching for:', query);
      navigate(`${ROUTES.LISTINGS}?q=${encodeURIComponent(query)}`);
    }
  };
  
  // Handle filter
  const handleFilter = (filters: any) => {
    console.log('Applied filters:', filters);
    
    // Build query string from filters
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    
    navigate(`${ROUTES.LISTINGS}?${params.toString()}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section */}
      <div className="relative w-full h-[400px] rounded-lg overflow-hidden mb-8 flex items-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop&q=80"
            alt="Beautiful homes"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-20 text-white max-w-xl mx-5 md:mx-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Perfect Home
          </h1>
          <p className="text-lg mb-6 text-white/90">
            Discover thousands of properties for rent and sale all across Nigeria
          </p>
          
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <SearchFilterBar 
              onSearch={handleSearch}
              onFilter={handleFilter}
            />
          </div>
        </div>
      </div>
      
      {/* List Your Property CTA */}
      <div className="bg-primary/10 rounded-lg p-6 mb-8 flex flex-col sm:flex-row justify-between items-center">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Own a property?
          </h2>
          <p className="text-neutral-600">
            List your property on Kribs and connect with thousands of potential tenants and buyers
          </p>
        </div>
        <Button 
          size="lg" 
          className="w-full sm:w-auto"
          onClick={() => navigate(ROUTES.CREATE_LISTING)}
        >
          <Plus className="mr-2 h-4 w-4" /> List Your Property
        </Button>
      </div>
      
      {/* Featured Listings */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Properties</h2>
          <Button 
            variant="outline" 
            onClick={() => navigate(`${ROUTES.LISTINGS}?featured=true`)}
          >
            View All
          </Button>
        </div>
        
        <ListingGrid
          listings={featuredListings}
          loading={loading}
          size="large"
          columns={3}
          emptyMessage="No featured properties available at the moment"
          emptyIcon={<Building className="h-12 w-12" />}
        />
      </div>
      
      {/* Recent Listings */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recent Properties</h2>
          <Button 
            variant="outline" 
            onClick={() => navigate(ROUTES.LISTINGS)}
          >
            View All
          </Button>
        </div>
        
        <ListingGrid
          listings={recentListings}
          loading={loading}
          size="large"
          columns={3}
          emptyMessage="No recent properties available at the moment"
          emptyIcon={<Home className="h-12 w-12" />}
        />
      </div>
      
      {/* Browse By Location */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6">Browse By Location</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan'].map((city) => (
            <div 
              key={city}
              className="relative h-40 rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => navigate(`${ROUTES.LISTINGS}?location=${city}`)}
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300 z-10" />
              <img 
                src={`https://source.unsplash.com/featured/?${city},city`}
                alt={city}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="text-center">
                  <h3 className="text-white text-xl font-semibold mb-1">{city}</h3>
                  <div className="flex items-center text-white/90 text-sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>Properties</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;