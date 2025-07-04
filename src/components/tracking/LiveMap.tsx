
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Navigation, MapPin } from "lucide-react";
import { getHighAccuracyLocation, LocationData } from "@/services/locationService";
import { IBus } from "@/types";

const defaultCenter = {
  lat: 15.4909,
  lng: 73.8278
}; // Goa

const defaultZoom = 13;

interface BusLocations {
  [busId: string]: {
    latitude: number;
    longitude: number;
    updatedAt: string;
  };
}

interface LiveMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  buses?: IBus[];
  busLocations?: BusLocations;
  busPosition?: { lat: number; lng: number };
  stations?: Array<{
    _id: string;
    name: string;
    position: { lat: number; lng: number };
  }>;
  onBusSelect?: (busId: string) => void;
  onSelectBus?: (busId: string) => void;
  selectedBusId?: string;
  className?: string;
}

const LiveMap: React.FC<LiveMapProps> = ({
  center = defaultCenter,
  zoom = defaultZoom,
  buses = [],
  busLocations = {},
  busPosition,
  stations = [],
  onBusSelect,
  onSelectBus,
  selectedBusId,
  className = ""
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [busMarkers, setBusMarkers] = useState<{ [busId: string]: google.maps.Marker }>({});
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);
  const [stationMarkers, setStationMarkers] = useState<google.maps.Marker[]>([]);
  const [busPath, setBusPath] = useState<google.maps.Polyline | null>(null);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const handleBusSelect = onBusSelect || onSelectBus;

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          console.error("Google Maps API key is missing");
          toast.error("Unable to load map. API key missing.");
          return;
        }

        const loader = new Loader({
          apiKey,
          version: "weekly"
        });

        const google = await loader.load();
        if (!mapRef.current) return;

        const mapInstance = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          styles: [
            {
              featureType: "transit",
              elementType: "all",
              stylers: [{ visibility: "on" }]
            },
            {
              featureType: "transit.station.bus",
              elementType: "labels.icon",
              stylers: [{ visibility: "on" }]
            }
          ]
        });

        setMap(mapInstance);
      } catch (error) {
        console.error("Error initializing Google Maps:", error);
        toast.error("Failed to load the map. Please try again.");
      }
    };

    initMap();
  }, [center, zoom]);

  // Start/stop location tracking
  const toggleLocationTracking = useCallback(async () => {
    if (!isTracking) {
      try {
        const location = await getHighAccuracyLocation();
        setUserLocation(location);
        setIsTracking(true);
        
        // Start watching location changes
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation: LocationData = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            };
            setUserLocation(newLocation);
          },
          (error) => {
            console.error("Error watching location:", error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
          }
        );
        
        toast.success("Location tracking started");
      } catch (error) {
        console.error("Error starting location tracking:", error);
        toast.error("Failed to start location tracking. Please enable location access.");
      }
    } else {
      setIsTracking(false);
      toast.info("Location tracking stopped");
    }
  }, [isTracking]);

  // Create or update user location marker
  useEffect(() => {
    if (!map || !userLocation) return;

    if (userMarker) {
      userMarker.setPosition({
        lat: userLocation.lat,
        lng: userLocation.lng
      });
    } else {
      const newUserMarker = new google.maps.Marker({
        position: {
          lat: userLocation.lat,
          lng: userLocation.lng
        },
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeWeight: 3,
          strokeColor: "#FFFFFF"
        },
        title: "Your Location"
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div class="p-2"><strong>Your Current Location</strong><br/>
                  Accuracy: ${userLocation.accuracy?.toFixed(0)}m</div>`
      });

      newUserMarker.addListener("click", () => {
        infoWindow.open(map, newUserMarker);
      });

      setUserMarker(newUserMarker);
    }
  }, [map, userLocation, userMarker]);

  // Create or update bus markers for multiple buses
  useEffect(() => {
    if (!map) return;

    // Clear old markers that are no longer needed
    Object.keys(busMarkers).forEach(busId => {
      if (!busLocations[busId]) {
        busMarkers[busId].setMap(null);
        delete busMarkers[busId];
      }
    });

    // Create or update markers for active buses
    Object.entries(busLocations).forEach(([busId, location]) => {
      const position = { lat: location.latitude, lng: location.longitude };
      
      if (busMarkers[busId]) {
        busMarkers[busId].setPosition(position);
      } else {
        const bus = buses.find(b => b._id === busId);
        const newBusMarker = new google.maps.Marker({
          position,
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: selectedBusId === busId ? "#4CAF50" : "#FF5722",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#FFFFFF"
          },
          title: bus ? `Bus ${bus.name}` : `Bus ${busId}`
        });

        newBusMarker.addListener("click", () => {
          if (handleBusSelect) {
            handleBusSelect(busId);
          }
          map.panTo(position);
          map.setZoom(15);
        });

        setBusMarkers(prev => ({ ...prev, [busId]: newBusMarker }));
      }
    });
  }, [map, buses, busLocations, selectedBusId, handleBusSelect]);

  // Handle legacy single bus position
  useEffect(() => {
    if (!map || !busPosition || Object.keys(busLocations).length > 0) return;

    // This is for backward compatibility with single bus position
    const legacyBusMarker = new google.maps.Marker({
      position: busPosition,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#FF5722",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#FFFFFF"
      },
      title: "Bus Location"
    });

    legacyBusMarker.addListener("click", () => {
      if (handleBusSelect) {
        handleBusSelect("legacy-bus");
      }
      map.panTo(busPosition);
      map.setZoom(15);
    });

    return () => {
      legacyBusMarker.setMap(null);
    };
  }, [map, busPosition, busLocations, handleBusSelect]);

  // Create or update station markers
  useEffect(() => {
    if (!map) return;

    // Clear old markers
    stationMarkers.forEach(marker => marker.setMap(null));
    setStationMarkers([]);

    // Create new markers
    const newMarkers = stations.map(station => {
      const marker = new google.maps.Marker({
        position: station.position,
        map,
        title: station.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: "#6E59A5",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#FFFFFF"
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div class="p-2"><strong>${station.name}</strong></div>`
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      return marker;
    });

    setStationMarkers(newMarkers);
  }, [map, stations]);

  const centerOnUser = () => {
    if (!map || !userLocation) {
      toast.error("Current location not available");
      return;
    }
    map.panTo({
      lat: userLocation.lat,
      lng: userLocation.lng
    });
    map.setZoom(15);
  };

  const centerOnBus = () => {
    if (!map) {
      toast.error("Map not available");
      return;
    }

    if (selectedBusId && busLocations[selectedBusId]) {
      const location = busLocations[selectedBusId];
      map.panTo({ lat: location.latitude, lng: location.longitude });
      map.setZoom(15);
    } else if (busPosition) {
      map.panTo(busPosition);
      map.setZoom(15);
    } else {
      toast.error("Bus location not available");
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg shadow-md"
      />
      
      {/* Control buttons */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <Button
          variant="default"
          size="sm"
          className="bg-white text-primary hover:bg-primary hover:text-white shadow-lg"
          onClick={toggleLocationTracking}
        >
          <MapPin className="mr-1 h-4 w-4" />
          {isTracking ? "Stop Tracking" : "Track Location"}
        </Button>
        
        {userLocation && (
          <Button
            variant="default"
            size="sm"
            className="bg-white text-primary hover:bg-primary hover:text-white shadow-lg"
            onClick={centerOnUser}
          >
            <Navigation className="mr-1 h-4 w-4" />
            Center on Me
          </Button>
        )}
        
        {(busPosition || (selectedBusId && busLocations[selectedBusId])) && (
          <Button
            variant="default" 
            size="sm"
            className="bg-white text-primary hover:bg-primary hover:text-white shadow-lg"
            onClick={centerOnBus}
          >
            <Navigation className="mr-1 h-4 w-4" />
            Center on Bus
          </Button>
        )}
      </div>

      {/* Location status indicator */}
      {isTracking && (
        <div className="absolute top-4 left-4 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          📍 Live Location Active
        </div>
      )}
    </div>
  );
};

export default LiveMap;
