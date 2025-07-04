
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

interface ActiveTripDisplayProps {
  activeTrip: any;
}

export const ActiveTripDisplay: React.FC<ActiveTripDisplayProps> = ({ activeTrip }) => {
  if (!activeTrip) return null;

  const startTime = new Date(activeTrip.startLocation.timestamp);
  const duration = Math.floor((Date.now() - startTime.getTime()) / 1000 / 60); // minutes

  return (
    <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Navigation className="mr-2 h-5 w-5" />
            Active Trip
          </div>
          <Badge variant="secondary" className="bg-white text-orange-600">
            In Progress
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4" />
          <span className="text-sm">
            Started: {format(startTime, "MMM d, yyyy 'at' h:mm a")}
          </span>
        </div>
        
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4" />
          <span className="text-sm">
            Duration: {duration} minutes
          </span>
        </div>

        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4" />
          <span className="text-sm font-mono">
            {activeTrip.startLocation.latitude.toFixed(6)}, {activeTrip.startLocation.longitude.toFixed(6)}
          </span>
        </div>

        <div className="mt-4 p-2 bg-white bg-opacity-20 rounded">
          <p className="text-xs">
            Your trip is active. It will automatically end when you scan the QR code at your destination.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
