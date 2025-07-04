
import React from 'react';
import { Navigation, MapPin } from "lucide-react";

interface TripInfoDisplayProps {
  activeTrip: any;
  location: { lat: number; lng: number } | null;
}

export const TripInfoDisplay: React.FC<TripInfoDisplayProps> = ({
  activeTrip,
  location,
}) => {
  // Helper function to safely get trip start time
  const getTripStartTime = () => {
    if (activeTrip && activeTrip.startLocation && activeTrip.startLocation.timestamp) {
      return new Date(activeTrip.startLocation.timestamp).toLocaleTimeString();
    }
    return "Unknown time";
  };

  return (
    <>
      <div className="text-center mb-6">
        <div className="inline-block p-3 bg-gray-800 rounded-full">
          {activeTrip ? (
            <Navigation className="h-8 w-8 text-orange-400" />
          ) : (
            <MapPin className="h-8 w-8 text-orange-400" />
          )}
        </div>
        
        <h3 className="mt-2 font-semibold text-lg text-white">
          {activeTrip ? "Trip in Progress" : "Ready to Start"}
        </h3>
        
        <p className="text-sm text-gray-400 mt-1">
          {activeTrip
            ? `Trip started at ${getTripStartTime()}`
            : "Your location has been detected"}
        </p>
        
        {location && (
          <p className="text-xs text-gray-500 mt-2 font-mono">
            Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        )}
      </div>
      
      {activeTrip && (
        <div className="p-3 bg-green-900/50 border border-green-600 rounded-md">
          <p className="text-sm text-green-200">
            Trip started at {getTripStartTime()}.
            Check out when you reach your destination.
          </p>
        </div>
      )}
    </>
  );
};
