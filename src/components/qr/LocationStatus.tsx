
import React from 'react';
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationStatusProps {
  isLoading: boolean;
  error: string | null;
  onCancel: () => void;
}

export const LocationStatus: React.FC<LocationStatusProps> = ({
  isLoading,
  error,
  onCancel,
}) => {
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="animate-spin h-8 w-8 text-orange-400 mx-auto" />
        <p className="mt-4 text-gray-300">Getting your location...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <X className="h-12 w-12 text-red-400 mx-auto" />
        <p className="mt-2 text-red-400 font-medium">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
          onClick={onCancel}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return null;
};
