
import { useState } from 'react';
import { tripsAPI } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";

interface LocationData {
  lat: number;
  lng: number;
}

export const useTripOperations = (userId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleCheckIn = async (userId: string, location: LocationData) => {
    setIsLoading(true);
    try {
      console.log("Starting check-in for user:", userId, "at coordinates:", location);
      const result = await tripsAPI.startTrip(userId, location.lat, location.lng);
      console.log("Check-in successful:", result);
      
      toast.success("Check-in successful! Trip started.", {
        description: `Started at ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
      });
      
      return result;
    } catch (error: any) {
      console.error("Check-in error:", error);
      toast.error("Check-in failed", {
        description: error.message || "Failed to check in user"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async (tripId: string, location: LocationData) => {
    setIsLoading(true);
    try {
      console.log("Starting check-out for trip:", tripId, "at coordinates:", location);
      const result = await tripsAPI.endTrip(tripId, location.lat, location.lng);
      console.log("Check-out successful:", result);
      
      if (result.success) {
        const fare = result.trip?.fare || 0;
        const distance = result.trip?.distance || 0;
        const tripDetails = `Distance: ${distance.toFixed(2)} km, Fare: ₹${fare.toFixed(2)}`;

        if (result.deduction?.status === 'success') {
          toast.success("Check-out successful!", {
            description: `${tripDetails}. ${result.deduction.message}`,
            duration: 6000,
          });
          
          // Force refresh wallet after successful fare deduction
          if (userId) {
            console.log("Refreshing wallet after successful fare deduction");
            await queryClient.invalidateQueries({ queryKey: ['wallet', userId] });
          }
        } else {
          toast.warning("Trip completed, but payment issue occurred.", {
            description: `${tripDetails}. ${result.deduction?.message || 'Payment processing failed.'}`,
            duration: 8000,
          });
        }
      } else {
        toast.error("Check-out failed", {
          description: result.error || "Please try again."
        });
      }

      return result;
    } catch (error: any) {
      console.error("Check-out error:", error);
      toast.error("Check-out failed", {
        description: error.message || "Failed to check out user"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleCheckIn,
    handleCheckOut,
    isLoading,
  };
};
