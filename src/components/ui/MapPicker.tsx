import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Locate } from "lucide-react";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLocation?: { lat: number; lng: number };
}

export const MapPicker: React.FC<MapPickerProps> = ({
  onLocationSelect,
  initialLocation,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    let resizeObserver: ResizeObserver | null = null;

    try {
      // Initialize map
      const defaultCenter: [number, number] = initialLocation
        ? [initialLocation.lat, initialLocation.lng]
        : [30.0444, 31.2357]; // Cairo, Egypt

      map.current = L.map(mapContainer.current).setView(defaultCenter, 13);

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map.current);

      // Add zoom control
      map.current.zoomControl.setPosition("topright");

      // Use ResizeObserver to handle container size changes
      resizeObserver = new ResizeObserver(() => {
        map.current?.invalidateSize();
      });
      resizeObserver.observe(mapContainer.current);

      // Handle map clicks
      map.current.on("click", async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;

        // Remove existing marker
        if (marker.current) {
          marker.current.remove();
        }

        // Add new marker
        marker.current = L.marker([lat, lng]).addTo(map.current!);

        // Get address using Nominatim (OpenStreetMap's free geocoding service)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            {
              headers: {
                "User-Agent": "LostAndFoundApp/1.0",
              },
            }
          );
          const data = await response.json();
          const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          onLocationSelect(lat, lng, address);
        } catch (error) {
          console.error("Error getting address:", error);
          // Fallback to coordinates if geocoding fails
          onLocationSelect(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      });

      // If initial location, add marker
      if (initialLocation) {
        marker.current = L.marker([initialLocation.lat, initialLocation.lng]).addTo(
          map.current
        );
      }

      map.current.on("load", () => {
        setIsLoading(false);
      });

      // Map is ready
      setIsLoading(false);
    } catch (error) {
      console.error("Error initializing map:", error);
      setIsLoading(false);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (marker.current) {
        marker.current.remove();
      }
    };
  }, []); // Run only once

  // Separate effect to handle updates to initialLocation
  useEffect(() => {
    if (map.current && initialLocation) {
      map.current.setView([initialLocation.lat, initialLocation.lng], 13);
      if (marker.current) {
        marker.current.remove();
      }
      marker.current = L.marker([initialLocation.lat, initialLocation.lng]).addTo(map.current);
    }
  }, [initialLocation]);

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          if (map.current) {
            map.current.setView([latitude, longitude], 15);

            // Remove existing marker
            if (marker.current) {
              marker.current.remove();
            }

            // Add new marker
            marker.current = L.marker([latitude, longitude]).addTo(map.current);

            // Get address
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                {
                  headers: {
                    "User-Agent": "LostAndFoundApp/1.0",
                  },
                }
              );
              const data = await response.json();
              const address = data.display_name || "Current location";
              onLocationSelect(latitude, longitude, address);
            } catch (error) {
              console.error("Error getting address:", error);
              onLocationSelect(latitude, longitude, "Current location");
            }
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please enable location services.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-300">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[1000]">
          <p className="text-gray-600">Loading map...</p>
        </div>
      )}

      {/* Current location button */}
      <button
        onClick={getCurrentLocation}
        className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-md hover:bg-gray-100 transition-colors z-[1000]"
        title="Get current location"
      >
        <Locate className="w-5 h-5 text-blue-600" />
      </button>

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md z-[1000]">
        <p className="text-xs text-gray-700">Click on the map to select a location</p>
      </div>
    </div>
  );
};
