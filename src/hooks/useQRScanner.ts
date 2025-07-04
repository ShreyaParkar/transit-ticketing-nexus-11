
import { useState, useEffect } from 'react';
import { tripsAPI, passesAPI } from '@/services/api';
import { toast } from "sonner";
import { getHighAccuracyLocation } from '@/services/locationService';
import { extractUserIdFromQR, validateQRCode } from '@/services/qrProcessingService';
import { useTripOperations } from '@/hooks/useTripOperations';
import { useUser } from '@/context/UserContext';

export const useQRScanner = () => {
  const [scanned, setScanned] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { userId: currentUserId } = useUser();
  const { handleCheckIn, handleCheckOut, isLoading } = useTripOperations(currentUserId || undefined);

  // Fetch location with high accuracy on mount
  useEffect(() => {
    const fetchLocation = async () => {
      setIsLoadingLocation(true);
      setLocationError(null);
      
      try {
        const locationData = await getHighAccuracyLocation();
        setLocation({
          lat: locationData.lat,
          lng: locationData.lng
        });
        setLocationError(null);
      } catch (error: any) {
        console.error("Error getting location for QR scanner:", error);
        setLocation(null);
        setLocationError(error.message);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    fetchLocation();
  }, []);

  // Function to handle successful QR scan with automatic processing
  const handleScan = async (data: string | null) => {
    if (data && !scanned && !isProcessing) {
      console.log("QR Code scanned:", data);
      
      // Validate QR code first
      const validation = validateQRCode(data);
      if (!validation.isValid) {
        toast.error(validation.error || "Invalid QR code format");
        return;
      }

      // Check if it's a pass QR code
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.type === 'pass') {
          await handlePassQR(parsedData);
          return;
        }
      } catch (e) {
        // Not JSON, continue with user QR processing
      }
      
      const extractedUserId = extractUserIdFromQR(data);
      if (!extractedUserId) {
        toast.error("Invalid QR code format. Please scan a valid user QR code.");
        return;
      }
      
      setIsProcessing(true);
      setScanned(true);
      setUserId(extractedUserId);
      setConnectionError(false);
      
      if (!location) {
        toast.error("Unable to get current location. Please enable location services and try again.");
        resetScanner();
        return;
      }

      try {
        console.log("Checking trip status for user:", extractedUserId);
        const trip = await tripsAPI.getActiveTrip(extractedUserId);
        setActiveTrip(trip);

        // Automatic processing based on trip status
        if (trip) {
          // User has active trip - automatically check out
          toast.success(`Active trip found. Processing check-out...`);
          console.log("Auto-processing check-out for trip:", trip._id);
          
          await handleCheckOut(trip._id, location);
          
          toast.success("Check-out completed successfully!");
          setTimeout(resetScanner, 2000);
        } else {
          // No active trip - automatically check in
          toast.success(`User identified. Processing check-in...`);
          console.log("Auto-processing check-in for user:", extractedUserId);
          
          await handleCheckIn(extractedUserId, location);
          
          toast.success("Check-in completed successfully!");
          setTimeout(resetScanner, 2000);
        }
      } catch (error: any) {
        console.error("Error processing QR scan:", error);
        if (error.message && error.message.includes("Server is not running")) {
          setConnectionError(true);
          toast.error("Backend server is not running. Please start the server first.");
        } else {
          toast.error("Failed to process scan. Please try again.");
        }
        resetScanner();
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Handle pass QR code validation
  const handlePassQR = async (passData: any) => {
    setIsProcessing(true);
    try {
      toast.loading("Validating pass...");
      
      const validation = await passesAPI.validatePass({
        qrData: JSON.stringify(passData),
        location: location ? `${location.lat},${location.lng}` : 'Unknown'
      });

      if (validation.valid) {
        toast.success("Pass validated successfully!", {
          description: `Valid monthly pass for ${passData.routeId || 'route'}. Usage recorded.`,
          duration: 4000,
        });
        
        // Show pass usage info
        setTimeout(() => {
          toast.info(`Pass usage count: ${validation.pass?.usageCount || 0}`, {
            description: "Pass is active and valid for unlimited rides.",
            duration: 3000,
          });
        }, 1000);
      } else {
        toast.error("Pass validation failed", {
          description: validation.message || "Pass may be expired or invalid",
        });
      }
    } catch (error: any) {
      console.error("Pass validation error:", error);
      toast.error("Failed to validate pass", {
        description: error.message || "Please try again"
      });
    } finally {
      setIsProcessing(false);
      setTimeout(resetScanner, 3000);
    }
  };

  const handleError = (error: any) => {
    console.error("QR Scan error:", error);
    toast.error("Failed to scan QR code. Please try again.");
    resetScanner();
  };

  const resetScanner = () => {
    setScanned(false);
    setUserId(null);
    setActiveTrip(null);
    setConnectionError(false);
    setIsProcessing(false);
  };

  // Manual functions for fallback (rarely needed now)
  const onCheckIn = async () => {
    if (!userId || !location) return;
    
    try {
      await handleCheckIn(userId, location);
      setTimeout(resetScanner, 2000);
    } catch (error) {
      // Error handling is done in useTripOperations hook
    }
  };

  const onCheckOut = async () => {
    if (!userId || !location || !activeTrip) return;
    
    try {
      await handleCheckOut(activeTrip._id, location);
      setTimeout(resetScanner, 3000);
    } catch (error) {
      // Error handling is done in useTripOperations hook
    }
  };
  
  return {
    scanned,
    userId,
    location,
    isLoadingLocation,
    isLoading: isLoading || isProcessing,
    activeTrip,
    connectionError,
    locationError,
    isProcessing,
    handleScan,
    handleError,
    handleCheckIn: onCheckIn,
    handleCheckOut: onCheckOut,
    handleReset: resetScanner,
  };
};
