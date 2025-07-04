
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Clock } from "lucide-react";

interface ScannedInfoProps {
  userId: string | null;
  location: { lat: number; lng: number } | null;
  activeTrip: any;
  isLoading: boolean;
  isProcessing?: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onReset: () => void;
}

export const ScannedInfo: React.FC<ScannedInfoProps> = ({
  userId,
  location,
  activeTrip,
  isLoading,
  isProcessing = false,
  onCheckIn,
  onCheckOut,
  onReset,
}) => {
  const isProcessingOrLoading = isLoading || isProcessing;

  return (
    <div className="text-center">
      <div className="mb-4">
        <p className="font-semibold text-high-contrast">User ID:</p>
        <p className="text-sm text-muted-high-contrast font-mono">{userId?.substring(0, 12)}...</p>
        {location && (
          <div className="mt-2">
            <p className="font-semibold text-high-contrast">Current Location:</p>
            <p className="text-xs text-muted-high-contrast font-mono">
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          </div>
        )}
        {activeTrip && (
          <div className="mt-4 p-3 bg-orange-900/50 border border-orange-600 rounded-md">
            <p className="text-sm text-orange-200">
              <span className="font-medium text-orange-100">Trip started:</span> {new Date(activeTrip.startLocation.timestamp).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>

      {/* Automatic Processing Status */}
      {isProcessingOrLoading && (
        <div className="mb-4 p-3 bg-blue-900/50 border border-blue-600 rounded-md">
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin h-4 w-4 mr-2 text-blue-300" />
            <span className="text-sm text-blue-200">
              {activeTrip ? "Processing automatic check-out..." : "Processing automatic check-in..."}
            </span>
          </div>
        </div>
      )}

      {/* Success indicator when processing is complete */}
      {!isProcessingOrLoading && (userId || activeTrip) && (
        <div className="mb-4 p-3 bg-green-900/50 border border-green-600 rounded-md">
          <div className="flex items-center justify-center">
            <CheckCircle className="h-4 w-4 mr-2 text-green-300" />
            <span className="text-sm text-green-200">
              {activeTrip ? "Ready for automatic check-out" : "Ready for automatic check-in"}
            </span>
          </div>
        </div>
      )}

      {/* Manual controls (for fallback) */}
      <div className="flex justify-center space-x-2 mt-4">
        {activeTrip ? (
          <Button
            variant="destructive"
            onClick={onCheckOut}
            disabled={isProcessingOrLoading}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            {isProcessingOrLoading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Processing...
              </>
            ) : (
              "Manual Check Out"
            )}
          </Button>
        ) : (
          <Button
            onClick={onCheckIn}
            disabled={isProcessingOrLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          >
            {isProcessingOrLoading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Processing...
              </>
            ) : (
              "Manual Check In"
            )}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={onReset}
          disabled={isProcessingOrLoading}
          className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 font-semibold"
        >
          {isProcessingOrLoading ? "Wait..." : "Cancel"}
        </Button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <Clock className="inline h-3 w-3 mr-1" />
        Automatic processing enabled - manual controls for fallback only
      </div>
    </div>
  );
};
