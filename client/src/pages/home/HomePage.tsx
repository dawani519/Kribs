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
import { supabase } from '../../lib/supabase';

const HomePage: React.FC = () => {
  const [, navigate] = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch featured and recent listings from Supabase if available
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        
        let featuredData = [];
        let recentData = [];
        
        // Check if the 'listings' table exists by trying to query it
        const { error: checkError } = await supabase
          .from('listings')
          .select('count', { count: 'exact', head: true });
        
        // If the table exists, fetch the data
        if (!checkError) {
          // Fetch featured listings from Supabase
          const { data: featured, error: featuredError } = await supabase
            .from('listings')
            .select('*')
            .eq('featured', true)
            .eq('approved', true)
            .order('created_at', { ascending: false })
            .limit(3);
          
          if (!featuredError) {
            featuredData = featured || [];
          }
          
          // Fetch recent listings from Supabase
          const { data: recent, error: recentError } = await supabase
            .from('listings')
            .select('*')
            .eq('approved', true)
            .order('created_at', { ascending: false })
            .limit(6);
          
          if (!recentError) {
            recentData = recent || [];
          }
        } else {
          console.log('The listings table does not exist yet. Showing empty state.');
        }
        
        // Format the data for our components with all required fields
        const formattedFeatured = featuredData.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          type: item.type,
          category: item.category || '',
          address: item.address,
          city: item.city || '',
          state: item.state || '',
          country: item.country || 'Nigeria',
          price: item.price,
          lat: item.lat || 0,
          lng: item.lng || 0,
          photos: item.photos || [],
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          squareMeters: item.square_meters,
          amenities: item.amenities || [],
          ownerId: item.owner_id || 0,
          featured: true,
          approved: true,
          createdAt: item.created_at || new Date().toISOString(),
          updatedAt: item.updated_at || item.created_at || new Date().toISOString()
        }));
        
        const formattedRecent = recentData.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          type: item.type,
          category: item.category || '',
          address: item.address,
          city: item.city || '',
          state: item.state || '',
          country: item.country || 'Nigeria',
          price: item.price,
          lat: item.lat || 0,
          lng: item.lng || 0,
          photos: item.photos || [],
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          squareMeters: item.square_meters,
          amenities: item.amenities || [],
          ownerId: item.owner_id || 0,
          featured: Boolean(item.featured),
          approved: true,
          createdAt: item.created_at,
          updatedAt: item.updated_at || item.created_at
        }));
        
        setFeaturedListings(formattedFeatured);
        setRecentListings(formattedRecent);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchListings();
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