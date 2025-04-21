import { useState, useEffect } from 'react';
import { MAP_SETTINGS } from '@/config/constants';

interface Coordinates {
  lat: number;
  lng: number;
}

interface GeoLocationState {
  coordinates: Coordinates | null;
  error: string | null;
  loading: boolean;
  getLocation: () => Promise<void>;
}

export function useGeoLocation(): GeoLocationState {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Function to get user's current position
  const getLocation = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      setCoordinates({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    } catch (error: any) {
      console.error('Error getting geolocation:', error);
      setError(error.message || 'Failed to get your location');
      
      // Fall back to IP-based geolocation if browser geolocation fails
      try {
        await getLocationByIP();
      } catch (ipError) {
        console.error('IP geolocation fallback also failed:', ipError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to get location based on IP (fallback)
  const getLocationByIP = async (): Promise<void> => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      
      if (!response.ok) {
        throw new Error('Failed to get location from IP');
      }
      
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        setCoordinates({
          lat: data.latitude,
          lng: data.longitude
        });
        setError(null);
      } else {
        throw new Error('Location data not available');
      }
    } catch (error: any) {
      console.error('Error getting location by IP:', error);
      setError(error.message || 'Failed to determine your location');
      
      // Last resort: use default coordinates (Lagos, Nigeria)
      setCoordinates(MAP_SETTINGS.DEFAULT_CENTER);
    }
  };

  // Initialize location on component mount
  useEffect(() => {
    getLocation();
  }, []);

  return { coordinates, error, loading, getLocation };
}
