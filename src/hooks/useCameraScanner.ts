
import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';

interface UseCameraScannerProps {
  onScan: (data: string | null) => void;
  onError: (error: any) => void;
  containerId: string;
}

export const useCameraScanner = ({ onScan, onError, containerId }: UseCameraScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);
  
  const safeStopScanner = async () => {
    try {
      if (scannerRef.current && isScanning) {
        console.log("Stopping scanner...");
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        console.log("Scanner stopped and cleared successfully");
      }
    } catch (err) {
      console.log("Scanner stop/clear error (this is normal):", err);
    } finally {
      if (mountedRef.current) {
        setIsScanning(false);
      }
    }
  };

  const clearScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (err) {
        console.log("Scanner clear error:", err);
      }
      scannerRef.current = null;
    }
  };

  const startScanner = async (scanner: Html5Qrcode, deviceId: string) => {
    try {
      if (!mountedRef.current) return;
      
      const config = { 
        fps: 5,
        qrbox: { width: 200, height: 200 },
        aspectRatio: 1.0,
        disableFlip: false,
        videoConstraints: {
          facingMode: "environment"
        }
      };

      if (mountedRef.current) {
        setIsScanning(true);
      }
      
      await scanner.start(
        deviceId, 
        config,
        (decodedText) => {
          console.log("QR Code scanned:", decodedText);
          if (mountedRef.current) {
            onScan(decodedText);
            toast.success("QR Code scanned successfully!");
          }
        },
        (errorMessage) => {
          if (!errorMessage.includes('QR code not found') && 
              !errorMessage.includes('No MultiFormat Readers') &&
              !errorMessage.includes('NotFoundException')) {
            console.warn("QR Scanner warning:", errorMessage);
          }
        }
      );
      
      console.log("QR Scanner started successfully");
    } catch (err) {
      console.error("Scanner start error:", err);
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : "Failed to start camera";
        setError(errorMessage);
        setIsScanning(false);
      }
      throw err;
    }
  };

  const initializeScanner = async () => {
    if (!mountedRef.current) return;
    
    try {
      setError(null);
      console.log("Initializing QR scanner...");
      
      const scannerElement = document.getElementById(containerId);
      if (!scannerElement) {
        console.log("Scanner element not found, retrying...");
        initTimeoutRef.current = setTimeout(initializeScanner, 200);
        return;
      }

      await safeStopScanner();
      clearScanner();
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!mountedRef.current) return;

      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;
      
      console.log("Getting camera devices...");
      const devices = await Html5Qrcode.getCameras();
      console.log("Available cameras:", devices.length);
      
      if (devices && devices.length > 0) {
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );
        const cameraId = backCamera ? backCamera.id : devices[0].id;
        
        console.log("Starting scanner with camera:", cameraId);
        await startScanner(html5QrCode, cameraId);
        
        if (mountedRef.current) {
          setIsInitialized(true);
        }
      } else {
        throw new Error("No cameras found on this device");
      }
    } catch (err) {
      console.error("Error initializing scanner:", err);
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : "Failed to initialize camera";
        setError(errorMessage);
        toast.error(`Camera Error: ${errorMessage}`);
        onError(errorMessage);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    initTimeoutRef.current = setTimeout(initializeScanner, 100);
    
    return () => {
      mountedRef.current = false;
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      
      const cleanup = async () => {
        await safeStopScanner();
        clearScanner();
      };
      cleanup();
    };
  }, [onScan, onError]);

  return {
    isScanning,
    isInitialized,
    error,
    initializeScanner
  };
};
