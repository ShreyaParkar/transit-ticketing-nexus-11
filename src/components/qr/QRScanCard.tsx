
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation, MapPin } from "lucide-react";
import { LocationStatus } from './LocationStatus';
import { TripInfoDisplay } from './TripInfoDisplay';
import { TripActions } from './TripActions';

interface QRScanCardProps {
  userId: string | null;
  activeTrip: any;
  location: { lat: number; lng: number } | null;
  isLoading: boolean;
  error: string | null;
  isProcessing: boolean;
  isAuthenticated: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onCancel: () => void;
}

export const QRScanCard: React.FC<QRScanCardProps> = ({
  userId,
  activeTrip,
  location,
  isLoading,
  error,
  isProcessing,
  isAuthenticated,
  onCheckIn,
  onCheckOut,
  onCancel,
}) => {
  return (
    <Card className="bg-gray-900 border-gray-700 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-orange-600/20 to-transparent border-b border-gray-700">
        <CardTitle className="flex items-center text-white">
          {activeTrip ? (
            <Navigation className="mr-2 h-5 w-5 text-orange-400" />
          ) : (
            <MapPin className="mr-2 h-5 w-5 text-orange-400" />
          )}
          {activeTrip ? "Trip in Progress" : "Start Trip"}
        </CardTitle>
        <CardDescription className="text-gray-300">
          {activeTrip 
            ? "You're currently on a trip. Check-out when you reach your destination." 
            : "Tap check-in to start your journey"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 pb-4 bg-gray-900">
        {!isAuthenticated && (
          <div className="mb-4 p-3 bg-amber-900/50 border border-amber-600 rounded-md text-amber-200 text-sm">
            <p>Please log in to use this feature</p>
          </div>
        )}
        
        <LocationStatus
          isLoading={isLoading}
          error={error}
          onCancel={onCancel}
        />
        
        {!isLoading && !error && (
          <TripInfoDisplay
            activeTrip={activeTrip}
            location={location}
          />
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-800/50 flex justify-between border-t border-gray-700">
        <TripActions
          activeTrip={activeTrip}
          isLoading={isLoading}
          error={error}
          isProcessing={isProcessing}
          isAuthenticated={isAuthenticated}
          onCheckIn={onCheckIn}
          onCheckOut={onCheckOut}
          onCancel={onCancel}
        />
      </CardFooter>
    </Card>
  );
};
