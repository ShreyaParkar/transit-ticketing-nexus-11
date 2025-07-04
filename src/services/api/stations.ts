
import { IStation } from "@/types";
import { fetchAPI } from "./base";

// Stations API
export const stationsAPI = {
  getAll: async (params?: { routeId?: string; busId?: string }): Promise<IStation[]> => {
    const queryParams = new URLSearchParams();
    if (params?.routeId) queryParams.append("routeId", params.routeId);
    if (params?.busId) queryParams.append("busId", params.busId);

    try {
      return await fetchAPI(`/stations?${queryParams.toString()}`);
    } catch (error) {
      console.error("stationsAPI.getAll error:", error);
      return [];
    }
  },
  
  create: async (station: Omit<IStation, "_id" | "routeId" | "busId"> & { routeId: string; busId: string }): Promise<IStation> => {
    console.log('Creating station with data:', station);
    return fetchAPI("/stations", {
      method: "POST",
      body: JSON.stringify({
        routeId: station.routeId,
        busId: station.busId,
        name: station.name,
        latitude: Number(station.latitude),
        longitude: Number(station.longitude),
        fare: Number(station.fare),
        location: station.location || station.name
      }),
    });
  },
    
  update: async (station: Omit<IStation, "routeId" | "busId"> & { routeId: string; busId: string }): Promise<IStation> => {
    console.log('Updating station with data:', station);
    return fetchAPI(`/stations/${station._id}`, {
      method: "PUT",
      body: JSON.stringify({
        routeId: station.routeId,
        busId: station.busId,
        name: station.name,
        latitude: Number(station.latitude),
        longitude: Number(station.longitude),
        fare: Number(station.fare),
        location: station.location || station.name
      }),
    });
  },
    
  delete: async (id: string): Promise<{ message: string }> => {
    return fetchAPI(`/stations/${id}`, {
      method: "DELETE",
    });
  },
};
