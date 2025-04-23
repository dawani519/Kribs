import React, { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { MAP_SETTINGS } from '../config/constants';

interface Coordinates {
  lat: number;
  lng: number;
}

interface MapPickerProps {
  initialCoordinates?: Coordinates;
  initialAddress?: string;
  onLocationSelect?: (coordinates: Coordinates, address: string) => void;
  height?: string;
  readOnly?: boolean;
}

/**
 * MapPicker component - allows selecting a location on a map
 */
const MapPicker: React.FC<MapPickerProps> = ({
  initialCoordinates = MAP_SETTINGS.DEFAULT_CENTER,
  initialAddress = '',
  onLocationSelect,
  height = '400px',
  readOnly = false,
}: MapPickerProps) => {
  const [coordinates, setCoordinates] = useState<Coordinates>(initialCoordinates);
  const [address, setAddress] = useState<string>(initialAddress);
  const [searchAddress, setSearchAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  
  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }
      
      const googleMapsApiKey = MAP_SETTINGS.API_KEY;
      if (!googleMapsApiKey) {
        console.error('Google Maps API key is missing');
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        initializeMap();
      };
      
      script.onerror = () => {
        console.error('Failed to load Google Maps script');
      };
      
      document.head.appendChild(script);
    };
    
    loadGoogleMaps();
    
    return () => {
      // Clean up Google Maps instance if needed
    };
  }, []);
  
  // Initialize the map
  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;
    
    const mapOptions: google.maps.MapOptions = {
      center: coordinates,
      zoom: MAP_SETTINGS.DEFAULT_ZOOM,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    };
    
    const map = new window.google.maps.Map(mapRef.current, mapOptions);
    googleMapRef.current = map;
    
    // Add marker
    const marker = new window.google.maps.Marker({
      position: coordinates,
      map,
      draggable: !readOnly,
      animation: window.google.maps.Animation.DROP,
    });
    markerRef.current = marker;
    
    // If not in read-only mode, set up events for marker drag
    if (!readOnly) {
      // When marker is dragged, update coordinates and get address
      marker.addListener('dragend', () => {
        if (marker.getPosition()) {
          const position = marker.getPosition()!.toJSON();
          setCoordinates(position);
          reverseGeocode(position);
        }
      });
      
      // Click on map to move marker
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        
        const position = e.latLng.toJSON();
        marker.setPosition(position);
        setCoordinates(position);
        reverseGeocode(position);
      });
    }
    
    // If we have an initial address, geocode it to get coordinates
    if (initialAddress && !initialCoordinates) {
      geocodeAddress(initialAddress);
    } else if (initialCoordinates) {
      // If we have initial coordinates but no address, reverse geocode to get address
      if (!initialAddress) {
        reverseGeocode(initialCoordinates);
      }
    }
    
    setIsMapLoaded(true);
  };
  
  // Geocode address to get coordinates
  const geocodeAddress = async (addressToGeocode: string) => {
    if (!window.google || !googleMapRef.current) return;
    
    setIsLoading(true);
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address: addressToGeocode }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location.toJSON();
          
          setCoordinates(location);
          setAddress(results[0].formatted_address);
          
          // Update marker position
          if (markerRef.current) {
            markerRef.current.setPosition(location);
          }
          
          // Center map on location
          googleMapRef.current?.setCenter(location);
          
          // Call the callback with new location
          if (onLocationSelect) {
            onLocationSelect(location, results[0].formatted_address);
          }
        } else {
          console.error('Geocode was not successful:', status);
        }
        
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error geocoding address:', error);
      setIsLoading(false);
    }
  };
  
  // Reverse geocode coordinates to get address
  const reverseGeocode = async (coords: Coordinates) => {
    if (!window.google) return;
    
    setIsLoading(true);
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ location: coords }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setAddress(results[0].formatted_address);
          
          // Call the callback with new location
          if (onLocationSelect) {
            onLocationSelect(coords, results[0].formatted_address);
          }
        } else {
          console.error('Reverse geocode was not successful:', status);
        }
        
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setIsLoading(false);
    }
  };
  
  // Handle search button click
  const handleSearch = () => {
    if (!searchAddress.trim()) return;
    geocodeAddress(searchAddress);
  };
  
  // Handle search input keydown
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };
  
  return (
    <Card className="border overflow-hidden">
      <CardContent className="p-0">
        {/* Map container */}
        <div
          ref={mapRef}
          className="w-full"
          style={{ height }}
        />
        
        {/* Search bar */}
        {!readOnly && (
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                placeholder="Search for an address"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="flex-1"
                disabled={isLoading || !isMapLoaded}
              />
              <Button 
                onClick={handleSearch}
                disabled={isLoading || !isMapLoaded || !searchAddress.trim()}
              >
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
            
            {address && (
              <div className="mt-2 text-sm text-neutral-600">
                <strong>Selected address:</strong> {address}
              </div>
            )}
            
            <div className="mt-1 text-xs text-neutral-500">
              <strong>Coordinates:</strong> {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapPicker;