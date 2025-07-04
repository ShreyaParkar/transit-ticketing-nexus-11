
import { IBus } from "@/types";
import { fetchAPI } from "./base";

// Buses API
export const busesAPI = {
  getAll: async (routeId?: string): Promise<IBus[]> => {
    try {
      console.log('busesAPI.getAll called with routeId:', routeId);
      const url = `/buses${routeId ? `?routeId=${routeId}` : ""}`;
      console.log('Making request to:', url);
      const result = await fetchAPI(url);
      console.log('busesAPI.getAll result:', result);
      return result as IBus[];
    } catch (error) {
      console.error("busesAPI.getAll error:", error);
      throw error; // Re-throw to let React Query handle it
    }
  },

  getByRoute: async (routeId: string): Promise<IBus[]> => {
    try {
      console.log('busesAPI.getByRoute called with routeId:', routeId);
      const url = `/buses?routeId=${routeId}`;
      console.log('Making request to:', url);
      const result = await fetchAPI(url);
      console.log('busesAPI.getByRoute result:', result);
      return result as IBus[];
    } catch (error) {
      console.error("busesAPI.getByRoute error:", error);
      throw error;
    }
  },
    
  create: async (bus: Omit<IBus, "_id" | "route"> & { route: string }): Promise<IBus> => {
    try {
      console.log('busesAPI.create called with:', bus);
      const result = await fetchAPI("/buses", {
        method: "POST",
        body: JSON.stringify({
          name: bus.name,
          route: bus.route,
          capacity: bus.capacity,
        }),
      });
      console.log('busesAPI.create result:', result);
      return result as IBus;
    } catch (error) {
      console.error("busesAPI.create error:", error);
      throw error;
    }
  },
    
  update: async (bus: Omit<IBus, "route"> & { route: string }): Promise<IBus> => {
    try {
      console.log('busesAPI.update called with:', bus);
      const result = await fetchAPI(`/buses/${bus._id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: bus.name,
          route: bus.route,
          capacity: bus.capacity,
        }),
      });
      console.log('busesAPI.update result:', result);
      return result as IBus;
    } catch (error) {
      console.error("busesAPI.update error:", error);
      throw error;
    }
  },
    
  delete: async (id: string): Promise<{ message: string }> => {
    try {
      console.log('busesAPI.delete called with id:', id);
      const result = await fetchAPI(`/buses/${id}`, {
        method: "DELETE",
      });
      console.log('busesAPI.delete result:', result);
      return result as { message: string };
    } catch (error) {
      console.error("busesAPI.delete error:", error);
      throw error;
    }
  },
};
