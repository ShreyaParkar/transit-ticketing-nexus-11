
import React from 'react';
import { QrScanner } from "@/components/qr/QrScanner";

interface ScannerViewProps {
  location: { lat: number; lng: number } | null;
  onScan: (data: string | null) => void;
  onError: (error: any) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({ location, onScan, onError }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-xs mx-auto mb-4">
        {location && (
          <QrScanner onScan={onScan} onError={onError} />
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Position the QR code in the center of the camera view
      </p>
      {!location && (
        <p className="text-xs text-amber-600 mt-2">
          📍 Getting your location...
        </p>
      )}
    </div>
  );
};
