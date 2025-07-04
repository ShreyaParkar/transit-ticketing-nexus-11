
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IBus } from '@/types';
import { BusLocations } from '@/types/tracking';
import { Button } from '@/components/ui/button';
import { Navigation, MapPin, RefreshCw } from 'lucide-react';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom bus icon
const busIcon = new L.DivIcon({
  html: `
    <div style="
      background-color: #FF5722;
      border: 3px solid white;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>
  `,
  className: 'bus-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Selected bus icon
const selectedBusIcon = new L.DivIcon({
  html: `
    <div style="
      background-color: #4CAF50;
      border: 3px solid white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      animation: pulse 2s infinite;
    "></div>
    <style>
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
    </style>
  `,
  className: 'selected-bus-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// User location icon
const userIcon = new L.DivIcon({
  html: `
    <div style="
      background-color: #4285F4;
      border: 3px solid white;
      border-radius: 50%;
      width: 14px;
      height: 14px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>
  `,
  className: 'user-marker',
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

interface LeafletMapProps {
  buses?: IBus[];
  busLocations?: BusLocations;
  selectedBusId?: string;
  onSelectBus?: (busId: string) => void;
  className?: string;
}

// Component to handle map centering
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

const LeafletMap: React.FC<LeafletMapProps> = ({
  buses = [],
  busLocations = {},
  selectedBusId,
  onSelectBus,
  className = ""
}) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  // Default to Goa coordinates
  const [mapCenter, setMapCenter] = useState<[number, number]>([15.4909, 73.8278]);
  const [mapZoom, setMapZoom] = useState(13);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Get user location
  const getUserLocation = async () => {
    setIsGettingLocation(true);
    setLocationError(null);
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
          }
        );
      });

      const userPos: [number, number] = [position.coords.latitude, position.coords.longitude];
      setUserLocation(userPos);
      console.log('User location obtained:', userPos);
    } catch (error: any) {
      console.error('Error getting location:', error);
      setLocationError('Failed to get your location. Please allow location access.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Center on user location
  const centerOnUser = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setMapZoom(15);
    } else {
      getUserLocation();
    }
  };

  // Center on selected bus
  const centerOnBus = () => {
    if (selectedBusId && busLocations[selectedBusId]) {
      const bus = busLocations[selectedBusId];
      setMapCenter([bus.latitude, bus.longitude]);
      setMapZoom(15);
    }
  };

  // Auto-center on first bus when tracking starts
  useEffect(() => {
    if (Object.keys(busLocations).length > 0 && !selectedBusId) {
      const firstBusId = Object.keys(busLocations)[0];
      const firstBus = busLocations[firstBusId];
      setMapCenter([firstBus.latitude, firstBus.longitude]);
      setMapZoom(14);
    }
  }, [busLocations, selectedBusId]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <strong>Your Location</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Bus markers */}
        {Object.entries(busLocations).map(([busId, location]) => {
          const bus = buses.find(b => b._id === busId);
          const isSelected = selectedBusId === busId;
          const timeSinceUpdate = Math.round((new Date().getTime() - new Date(location.updatedAt).getTime()) / 1000);
          
          return (
            <Marker
              key={busId}
              position={[location.latitude, location.longitude]}
              icon={isSelected ? selectedBusIcon : busIcon}
              eventHandlers={{
                click: () => {
                  if (onSelectBus) {
                    onSelectBus(busId);
                  }
                }
              }}
            >
              <Popup>
                <div className="text-center">
                  <strong>{bus ? `Bus ${bus.name}` : `Bus ${busId}`}</strong>
                  <br />
                  <div className="text-xs text-gray-600 mt-1">
                    Last updated: {timeSinceUpdate < 60 ? `${timeSinceUpdate}s ago` : `${Math.floor(timeSinceUpdate / 60)}m ago`}
                  </div>
                  {location.speed && (
                    <div className="text-xs text-gray-600">
                      Speed: {Math.round(location.speed)} km/h
                    </div>
                  )}
                  {location.heading !== undefined && (
                    <div className="text-xs text-gray-600">
                      Heading: {Math.round(location.heading)}°
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Control buttons */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        <Button
          variant="default"
          size="sm"
          className="bg-white text-primary hover:bg-primary hover:text-white shadow-lg"
          onClick={centerOnUser}
          disabled={isGettingLocation}
        >
          {isGettingLocation ? (
            <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="mr-1 h-4 w-4" />
          )}
          {userLocation ? 'My Location' : 'Get Location'}
        </Button>
        
        {selectedBusId && busLocations[selectedBusId] && (
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

      {/* Status indicators */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        {Object.keys(busLocations).length > 0 && (
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            📍 {Object.keys(busLocations).length} Bus(es) Live
          </div>
        )}
        
        {locationError && (
          <div className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs max-w-xs">
            ⚠️ {locationError}
          </div>
        )}
        
        {userLocation && (
          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            📍 Your Location Active
          </div>
        )}
      </div>
    </div>
  );
};

export default LeafletMap;
