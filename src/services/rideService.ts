
import { IRide } from "@/types";

export const rideService = {
  fetchRideHistory: async (userId: string): Promise<IRide[]> => {
    try {
      const response = await fetch(`/api/rides/history/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch ride history:', error);
      return [];
    }
  }
};
