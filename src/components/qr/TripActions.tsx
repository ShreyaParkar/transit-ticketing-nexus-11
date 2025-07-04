
import React from 'react';
import { Button } from "@/components/ui/button";
import { MapPin, Check, Loader2 } from "lucide-react";

interface TripActionsProps {
  activeTrip: any;
  isLoading: boolean;
  error: string | null;
  isProcessing: boolean;
  isAuthenticated: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onCancel: () => void;
}

export const TripActions: React.FC<TripActionsProps> = ({
  activeTrip,
  isLoading,
  error,
  isProcessing,
  isAuthenticated,
  onCheckIn,
  onCheckOut,
  onCancel,
}) => {
  return (
    <>
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={isProcessing}
        className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
      >
        Cancel
      </Button>
      
      <Button
        variant={activeTrip ? "destructive" : "default"}
        className={activeTrip ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"}
        onClick={activeTrip ? onCheckOut : onCheckIn}
        disabled={isLoading || !!error || isProcessing || !isAuthenticated}
      >
        {isProcessing ? (
          <span className="flex items-center">
            <Loader2 className="animate-spin h-4 w-4 mr-2" />
            Processing...
          </span>
        ) : activeTrip ? (
          <span className="flex items-center">
            <Check className="mr-2 h-4 w-4" />
            Check Out
          </span>
        ) : (
          <span className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            Check In
          </span>
        )}
      </Button>
    </>
  );
};
