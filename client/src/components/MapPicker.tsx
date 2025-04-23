import React, { useState, useEffect, useRef } from 'react';
import { GOOGLE_MAPS_API_KEY } from '../config/env';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { Label } from './ui/label';

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
  initialCoordinates,
  initialAddress = '',
  onLocationSelect,
  height = '300px',
  readOnly = false,
}: MapPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [address, setAddress] = useState(initialAddress);
  const [addressInput, setAddressInput] = useState(initialAddress);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  
  // Check if Google Maps API is available
  const isGoogleMapsAvailable = !!(GOOGLE_MAPS_API_KEY && window.google?.maps);
  
  // Initialize the map
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key is missing');
      return;
    }
    
    if (mapRef.current && !map && window.google?.maps) {
      setGoogleMapsLoaded(true);
      
      // Default coordinates (Lagos, Nigeria)
      const defaultCoordinates = { lat: 6.5244, lng: 3.3792 };
      const coordinates = initialCoordinates || defaultCoordinates;
      
      // Create the map
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: coordinates,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      
      // Create a marker at the specified coordinates
      const markerInstance = new window.google.maps.Marker({
        position: coordinates,
        map: mapInstance,
        draggable: !readOnly,
      });
      
      // Add event listener for marker drag end
      if (!readOnly) {
        markerInstance.addListener('dragend', () => {
          const position = markerInstance.getPosition();
          if (position) {
            const newCoordinates = { lat: position.lat(), lng: position.lng() };
            reverseGeocode(newCoordinates);
          }
        });
        
        // Add event listener for map click
        mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
          const position = event.latLng;
          if (position) {
            markerInstance.setPosition(position);
            const newCoordinates = { lat: position.lat(), lng: position.lng() };
            reverseGeocode(newCoordinates);
          }
        });
      }
      
      // Save instances to state
      setMap(mapInstance);
      setMarker(markerInstance);
      
      // If initialAddress is not provided but initialCoordinates is, reverse geocode to get the address
      if (initialCoordinates && !initialAddress) {
        reverseGeocode(initialCoordinates);
      }
    }
  }, [GOOGLE_MAPS_API_KEY, window.google?.maps]);
  
  // Update marker position when initialCoordinates change
  useEffect(() => {
    if (map && marker && initialCoordinates) {
      marker.setPosition(initialCoordinates);
      map.setCenter(initialCoordinates);
    }
  }, [initialCoordinates, map, marker]);
  
  // Update address and addressInput when initialAddress changes
  useEffect(() => {
    setAddress(initialAddress);
    setAddressInput(initialAddress);
  }, [initialAddress]);
  
  // Geocode address to coordinates
  const geocodeAddress = async () => {
    if (!addressInput.trim() || !window.google?.maps) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address: addressInput }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const newCoordinates = { lat: location.lat(), lng: location.lng() };
          
          // Update map and marker
          if (map && marker) {
            map.setCenter(newCoordinates);
            marker.setPosition(newCoordinates);
          }
          
          // Update address
          const formattedAddress = results[0].formatted_address;
          setAddress(formattedAddress);
          
          // Callback with new coordinates and address
          if (onLocationSelect) {
            onLocationSelect(newCoordinates, formattedAddress);
          }
        } else {
          setError('Could not find location. Please try a different address.');
        }
        
        setLoading(false);
      });
    } catch (error) {
      setError('Error finding location. Please try again.');
      setLoading(false);
    }
  };
  
  // Reverse geocode coordinates to address
  const reverseGeocode = async (coordinates: Coordinates) => {
    if (!window.google?.maps) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      const latlng = { lat: coordinates.lat, lng: coordinates.lng };
      
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const formattedAddress = results[0].formatted_address;
          setAddress(formattedAddress);
          setAddressInput(formattedAddress);
          
          // Callback with new coordinates and address
          if (onLocationSelect) {
            onLocationSelect(coordinates, formattedAddress);
          }
        } else {
          setError('Could not determine address for this location.');
        }
        
        setLoading(false);
      });
    } catch (error) {
      setError('Error finding address. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    geocodeAddress();
  };
  
  // No Google Maps API key
  if (!isGoogleMapsAvailable) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            Google Maps functionality is not available. Please provide a Google Maps API key.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input 
            id="address"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="Enter a location"
            disabled={readOnly}
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Address input */}
      {!readOnly && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <div className="flex space-x-2">
            <Input 
              id="address"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Enter an address to find on the map"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
              disabled={loading || !addressInput.trim()}
            >
              {loading ? 'Finding...' : 'Find'}
            </button>
          </div>
        </form>
      )}
      
      {/* Display address if in read-only mode */}
      {readOnly && address && (
        <div className="text-neutral-700">
          <strong>Location:</strong> {address}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Map container */}
      <div 
        ref={mapRef} 
        className="rounded-md overflow-hidden border border-neutral-200" 
        style={{ height, width: '100%' }}
      >
        {!googleMapsLoaded && (
          <div className="h-full w-full flex items-center justify-center bg-neutral-100">
            <div className="text-neutral-500">Loading map...</div>
          </div>
        )}
      </div>
      
      {/* Instructions */}
      {!readOnly && (
        <p className="text-sm text-neutral-500">
          Click on the map or drag the marker to select a location.
        </p>
      )}
    </div>
  );
};

export default MapPicker;