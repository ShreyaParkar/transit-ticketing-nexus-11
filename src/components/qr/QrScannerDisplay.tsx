
import React from 'react';

interface QrScannerDisplayProps {
  containerId: string;
  width: string;
  height: string;
  error: string | null;
  isScanning: boolean;
  isInitialized: boolean;
}

export const QrScannerDisplay: React.FC<QrScannerDisplayProps> = ({
  containerId,
  width,
  height,
  error,
  isScanning,
  isInitialized
}) => {
  if (error) {
    return (
      <div className="flex flex-col items-center w-full">
        <div 
          className="w-full bg-red-50 border border-red-200 rounded-lg flex items-center justify-center p-8"
          style={{ width, height }}
        >
          <div className="text-center">
            <p className="text-red-600 font-medium">Camera Error</p>
            <p className="text-sm text-red-500 mt-1">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Reload Page
            </button>
            <p className="text-xs text-gray-500 mt-2">
              If error persists, try closing other camera apps
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div 
        id={containerId} 
        style={{ width, height }} 
        className="overflow-hidden rounded-lg border border-muted bg-black"
      />
      <div className="mt-2 flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
        <p className="text-sm text-muted-foreground">
          {!isInitialized ? "Initializing camera..." : 
           isScanning ? "Scanning for QR code..." : "Camera not active"}
        </p>
      </div>
      {isScanning && (
        <p className="text-xs text-green-600 mt-1">
          Point camera at QR code to scan
        </p>
      )}
    </div>
  );
};
