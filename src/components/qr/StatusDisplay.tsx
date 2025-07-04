
import React from 'react';
import { Button } from "@/components/ui/button";

interface StatusDisplayProps {
  connectionError: boolean;
  locationError: string | null;
  isLoadingLocation: boolean;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  connectionError,
  locationError,
  isLoadingLocation,
}) => {
  if (connectionError) {
    return (
      <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
        <p className="text-red-700 text-sm">
          ⚠️ Backend server connection failed. Please ensure the server is running on port 3000.
        </p>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="flex flex-col items-center py-10">
        <p className="text-red-500 font-medium mb-2">{locationError}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (isLoadingLocation) {
    return (
      <div className="flex flex-col items-center py-10">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-3"></div>
        <p className="text-muted-foreground">Getting your location...</p>
      </div>
    );
  }

  return null;
};
