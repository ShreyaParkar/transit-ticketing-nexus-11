
import React from 'react';
import { useCameraScanner } from '@/hooks/useCameraScanner';
import { QrScannerDisplay } from './QrScannerDisplay';

interface QrScannerProps {
  onScan: (data: string | null) => void;
  onError: (error: any) => void;
  width?: string;
  height?: string;
}

export const QrScanner: React.FC<QrScannerProps> = ({ 
  onScan, 
  onError,
  width = '100%',
  height = '300px'
}) => {
  const scannerContainerId = `qr-reader-${Math.random().toString(36).substr(2, 9)}`;
  
  const { isScanning, isInitialized, error } = useCameraScanner({
    onScan,
    onError,
    containerId: scannerContainerId
  });

  return (
    <QrScannerDisplay
      containerId={scannerContainerId}
      width={width}
      height={height}
      error={error}
      isScanning={isScanning}
      isInitialized={isInitialized}
    />
  );
};
