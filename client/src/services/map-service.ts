import { API_ENDPOINTS, MAP_SETTINGS } from "@/config/constants";

// Add type definitions for Google Maps API
declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLElement, options: any) => any;
        Marker: new (options: any) => any;
        Geocoder: new () => {
          geocode: (request: any, callback: (results: any, status: string) => void) => void;
        };
        Animation: {
          DROP: number;
        };
        MapMouseEvent: any;
      };
    };
  }
}

interface Coordinates {
  lat: number;
  lng: number;
}

interface GeocodeResult {
  address: string;
  coordinates: Coordinates;
}

interface ReverseGeocodeResult {
  address: string;
  coordinates: Coordinates;
}

class MapService {
  // Google Maps API key
  private apiKey: string = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  constructor() {
    if (!this.apiKey) {
      console.warn('Google Maps API key is missing. Map functionality will be limited.');
    }
  }

  /**
   * Load Google Maps script
   */
  loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps script'));
      document.head.appendChild(script);
    });
  }

  /**
   * Geocode an address to coordinates
   */
  async geocodeAddress(address: string): Promise<GeocodeResult> {
    try {
      // Ensure Google Maps is loaded
      await this.loadGoogleMapsScript();
      
      return new Promise((resolve, reject) => {
        if (!window.google || !window.google.maps) {
          reject(new Error('Google Maps API not loaded'));
          return;
        }
        
        const geocoder = new window.google.maps.Geocoder();
        
        geocoder.geocode({ address }, (results: any, status: string) => {
          if (status === 'OK' && results && results.length > 0) {
            const location = results[0].geometry.location;
            
            resolve({
              address: results[0].formatted_address,
              coordinates: {
                lat: location.lat(),
                lng: location.lng()
              }
            });
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
    try {
      // Ensure Google Maps is loaded
      await this.loadGoogleMapsScript();
      
      return new Promise((resolve, reject) => {
        if (!window.google || !window.google.maps) {
          reject(new Error('Google Maps API not loaded'));
          return;
        }
        
        const geocoder = new window.google.maps.Geocoder();
        const latlng = { lat, lng };
        
        geocoder.geocode({ location: latlng }, (results: any, status: string) => {
          if (status === 'OK' && results && results.length > 0) {
            resolve({
              address: results[0].formatted_address,
              coordinates: { lat, lng }
            });
          } else {
            reject(new Error(`Reverse geocoding failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw error;
    }
  }

  /**
   * Calculate distance between two coordinates in kilometers
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * Get default center coordinates
   */
  getDefaultCenter(): Coordinates {
    return MAP_SETTINGS.DEFAULT_CENTER;
  }

  /**
   * Get default zoom level
   */
  getDefaultZoom(): number {
    return MAP_SETTINGS.DEFAULT_ZOOM;
  }

  /**
   * Get a static map image URL for a location
   */
  getStaticMapUrl(lat: number, lng: number, zoom: number = 14, width: number = 600, height: number = 300): string {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${lat},${lng}&key=${this.apiKey}`;
  }
}

export default new MapService();
