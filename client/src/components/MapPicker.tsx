import { useEffect, useRef, useState } from "react";
import mapService from "@/services/map-service";
import { Button } from "@/components/ui/button";
import { MAP_SETTINGS } from "@/config/constants";

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

const MapPicker = ({
  initialCoordinates = MAP_SETTINGS.DEFAULT_CENTER,
  initialAddress = "",
  onLocationSelect,
  height = "300px",
  readOnly = false
}: MapPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates>(initialCoordinates);
  const [address, setAddress] = useState<string>(initialAddress);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        await mapService.loadGoogleMapsScript();
        setMapLoaded(true);
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
        setError("Failed to load map. Please try again later.");
      }
    };

    initMap();
  }, []);

  // Set up map once script is loaded
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    try {
      // Create map
      const newMap = new google.maps.Map(mapRef.current, {
        center: coordinates,
        zoom: MAP_SETTINGS.DEFAULT_ZOOM,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });
      
      setMap(newMap);

      // Add marker
      const newMarker = new google.maps.Marker({
        position: coordinates,
        map: newMap,
        draggable: !readOnly,
        animation: google.maps.Animation.DROP
      });
      
      setMarker(newMarker);

      // Handle marker drag if not read-only
      if (!readOnly) {
        newMarker.addListener("dragend", async () => {
          if (!newMarker.getPosition()) return;
          
          const newLat = newMarker.getPosition()!.lat();
          const newLng = newMarker.getPosition()!.lng();
          
          setCoordinates({ lat: newLat, lng: newLng });
          
          try {
            const result = await mapService.reverseGeocode(newLat, newLng);
            setAddress(result.address);
            
            if (onLocationSelect) {
              onLocationSelect({ lat: newLat, lng: newLng }, result.address);
            }
          } catch (error) {
            console.error("Error reverse geocoding:", error);
          }
        });

        // Allow clicking on map to move marker
        newMap.addListener("click", async (e: google.maps.MapMouseEvent) => {
          const newLat = e.latLng!.lat();
          const newLng = e.latLng!.lng();
          
          newMarker.setPosition(e.latLng!);
          setCoordinates({ lat: newLat, lng: newLng });
          
          try {
            const result = await mapService.reverseGeocode(newLat, newLng);
            setAddress(result.address);
            
            if (onLocationSelect) {
              onLocationSelect({ lat: newLat, lng: newLng }, result.address);
            }
          } catch (error) {
            console.error("Error reverse geocoding:", error);
          }
        });
      }

      // If we have initial coordinates but no address, do reverse geocoding
      if (initialCoordinates && !initialAddress) {
        mapService.reverseGeocode(initialCoordinates.lat, initialCoordinates.lng)
          .then(result => {
            setAddress(result.address);
            if (onLocationSelect) {
              onLocationSelect(initialCoordinates, result.address);
            }
          })
          .catch(error => console.error("Error reverse geocoding initial coordinates:", error));
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      setError("Failed to initialize map. Please try again later.");
    }
  }, [mapLoaded, mapRef]);

  // Update marker position when initialCoordinates changes
  useEffect(() => {
    if (marker && map && initialCoordinates) {
      marker.setPosition(initialCoordinates);
      map.setCenter(initialCoordinates);
      setCoordinates(initialCoordinates);
    }
  }, [initialCoordinates, marker, map]);

  // Update address when initialAddress changes
  useEffect(() => {
    if (initialAddress) {
      setAddress(initialAddress);
    }
  }, [initialAddress]);

  // Handle address search if not read-only
  const handleSearch = async () => {
    if (!address || readOnly) return;

    try {
      const result = await mapService.geocodeAddress(address);
      setCoordinates(result.coordinates);
      setAddress(result.address);
      
      if (marker) {
        marker.setPosition(result.coordinates);
      }
      
      if (map) {
        map.setCenter(result.coordinates);
        map.setZoom(16);
      }
      
      if (onLocationSelect) {
        onLocationSelect(result.coordinates, result.address);
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      setError("Couldn't find this address. Please try another.");
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-500">{error}</p>
        <Button 
          onClick={() => setError(null)} 
          variant="outline" 
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!readOnly && (
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter address or location"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <i className="fas fa-search mr-1"></i> Search
          </Button>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="rounded-lg overflow-hidden border border-neutral-200"
        style={{ height }}
      >
        {!mapLoaded && (
          <div className="h-full flex items-center justify-center bg-neutral-100">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-primary text-2xl mb-2"></i>
              <p className="text-sm text-neutral-500">Loading map...</p>
            </div>
          </div>
        )}
      </div>
      
      {!readOnly && (
        <p className="text-xs text-neutral-500">
          <i className="fas fa-info-circle mr-1"></i>
          Click anywhere on the map to place the marker or drag the marker to adjust the location.
        </p>
      )}
    </div>
  );
};

export default MapPicker;
