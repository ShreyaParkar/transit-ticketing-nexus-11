
import { fetchAPI } from "./base";

// Trips API for QR Scanner with improved error handling
export const tripsAPI = {
  startTrip: async (userId: string, latitude: number, longitude: number): Promise<any> => {
    console.log('Starting trip for user:', userId);
    return fetchAPI("/trips/start", {
      method: "POST",
      body: JSON.stringify({ userId, latitude, longitude }),
    });
  },

  endTrip: async (tripId: string, latitude: number, longitude: number): Promise<any> => {
    console.log('Ending trip:', tripId);
    return fetchAPI(`/trips/${tripId}/end`, {
      method: "PUT",
      body: JSON.stringify({ latitude, longitude }),
    });
  },

  getActiveTrip: async (userId: string): Promise<any> => {
    try {
      console.log('Checking active trip for user:', userId);
      
      // Ensure userId is clean (no JSON encoding)
      const cleanUserId = encodeURIComponent(userId);
      
      const response: any = await fetchAPI(`/trips/active/${cleanUserId}`);
      
      if (response && typeof response === 'object') {
        if (response.active && response.trip) {
          console.log('Found active trip:', response.trip);
          return response.trip;
        }
      }
      
      console.log('No active trip found for user:', userId);
      return null;
    } catch (error: any) {
      console.log('No active trip found (expected):', error.message);
      return null;
    }
  },

  getUserTrips: async (userId: string): Promise<any[]> => {
    try {
      console.log('Fetching trip history for user:', userId);
      const cleanUserId = encodeURIComponent(userId);
      const trips = await fetchAPI(`/trips/user/${cleanUserId}`);
      return Array.isArray(trips) ? trips : [];
    } catch (error) {
      console.error('Error fetching user trips:', error);
      return [];
    }
  },
};
