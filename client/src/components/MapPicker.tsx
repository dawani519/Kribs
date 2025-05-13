// src/components/MapPicker.tsx
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

// Tell TypeScript about window.google
declare global {
  interface Window {
    google?: any;
  }
}

/**
 * Injects the Google Maps script tag once.
 */
const loadGoogleMapsScript = (() => {
  let promise: Promise<void> | null = null;
  return (apiKey: string) => {
    if (promise) return promise;
    promise = new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.onerror = () => reject(new Error('Failed to load Google Maps'));
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
    return promise;
  };
})();

/**
 * MapPicker component — lets you pick or display an address on Google Maps.
 */
const MapPicker: React.FC<MapPickerProps> = ({
  initialCoordinates,
  initialAddress = '',
  onLocationSelect,
  height = '300px',
  readOnly = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const [map, setMap] = useState<any>(null);
  const [address, setAddress] = useState(initialAddress);
  const [addressInput, setAddressInput] = useState(initialAddress);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isGoogleMapsAvailable = !!(GOOGLE_MAPS_API_KEY && window.google?.maps);

  // Load script + initialize map _once_
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key is missing');
      return;
    }

    let geocoder: any;
    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (!mapRef.current) return;

        geocoder = new window.google.maps.Geocoder();
        const defaultCoordinates = { lat: 6.5244, lng: 3.3792 };
        const coords = initialCoordinates || defaultCoordinates;

        // Create map
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: coords,
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        setMap(mapInstance);

        // Create marker
        const marker = new window.google.maps.Marker({
          position: coords,
          map: mapInstance,
          draggable: !readOnly,
        });
        markerRef.current = marker;

        // If draggable, wire up events
        if (!readOnly) {
          marker.addListener('dragend', () => {
            const pos = marker.getPosition();
            if (pos) reverseGeocode({ lat: pos.lat(), lng: pos.lng() });
          });
          mapInstance.addListener('click', (ev: any) => {
            const pos = ev.latLng;
            marker.setPosition(pos);
            reverseGeocode({ lat: pos.lat(), lng: pos.lng() });
          });
        }

        // If we have an initial address but no initial coords, geocode it
        if (!initialCoordinates && initialAddress) {
          geocodeAddress(initialAddress);
        }
      })
      .catch((err) => setError(err.message));
  }, []); // Run only once

  // keep marker in sync if parent moves it
  useEffect(() => {
    if (map && markerRef.current && initialCoordinates) {
      const { lat, lng } = initialCoordinates;
      markerRef.current.setPosition({ lat, lng });
      map.setCenter({ lat, lng });
    }
  }, [initialCoordinates, map]);

  // update address if parent changes it
  useEffect(() => {
    setAddress(initialAddress);
    setAddressInput(initialAddress);
  }, [initialAddress]);

  const geocodeAddress = (addr: string) => {
    if (!addr.trim() || !window.google?.maps) return;
    setLoading(true);
    setError(null);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: addr }, (results: any, status: string) => {
      if (status === 'OK' && results?.[0]) {
        const loc = results[0].geometry.location;
        const newCoords = { lat: loc.lat(), lng: loc.lng() };
        if (map && markerRef.current) {
          map.setCenter(newCoords);
          markerRef.current.setPosition(newCoords);
        }
        const formatted = results[0].formatted_address;
        setAddress(formatted);
        onLocationSelect?.(newCoords, formatted);
      } else {
        setError('Could not find location. Please try again.');
      }
      setLoading(false);
    });
  };

  const reverseGeocode = (coords: Coordinates) => {
    if (!window.google?.maps) return;
    setLoading(true);
    setError(null);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: coords }, (results: any, status: string) => {
      if (status === 'OK' && results?.[0]) {
        const formatted = results[0].formatted_address;
        setAddress(formatted);
        setAddressInput(formatted);
        onLocationSelect?.(coords, formatted);
      } else {
        setError('Could not determine address for this location.');
      }
      setLoading(false);
    });
  };

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
      {/* Address lookup */}
      {!readOnly && (
        <div className="space-y-2">
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
              type="button"
              onClick={() => geocodeAddress(addressInput)}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
              disabled={loading || !addressInput.trim()}
            >
              {loading ? 'Finding...' : 'Find'}
            </button>
          </div>
        </div>
      )}

      {readOnly && address && (
        <div className="text-neutral-700">
          <strong>Location:</strong> {address}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        ref={mapRef}
        className="rounded-md overflow-hidden border border-neutral-200"
        style={{ height, width: '100%' }}
      />

      {!readOnly && (
        <p className="text-sm text-neutral-500">
          Click on the map or drag the marker to select a location.
        </p>
      )}
    </div>
  );
};

export default MapPicker;
