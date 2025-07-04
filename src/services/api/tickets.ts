
import { ITicket } from "@/types";
import { fetchAPI } from "./base";

// Tickets API
export const ticketsAPI = {
  getByUserId: (userId: string): Promise<ITicket[]> => {
    if (!userId) {
      return Promise.resolve([]);
    }
    return fetchAPI(`/tickets?userId=${userId}`);
  },
    
  create: (ticket: { 
    userId: string; 
    routeId: string; 
    busId: string; 
    startStation: string; 
    endStation: string; 
    price: number; 
    paymentIntentId: string; 
    expiryDate: Date 
  }): Promise<{ success: boolean; ticket: ITicket }> =>
    fetchAPI("/tickets", {
      method: "POST",
      body: JSON.stringify(ticket),
    }),
};
