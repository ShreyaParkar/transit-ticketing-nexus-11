
import { IRide } from "@/types";
import { fetchAPI } from "./base";

// Rides API
export const ridesAPI = {
  getHistory: (userId: string): Promise<IRide[]> => {
    return fetchAPI(`/rides/history/${userId}`);
  },
};
