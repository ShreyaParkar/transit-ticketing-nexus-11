
import { fetchAPI, getAuthToken } from "./base";

// Unified Payment API with Stripe integration
export const paymentAPI = {
  createTicketCheckoutSession: async (
    stationId: string,
    busId: string,
    amount: number
  ): Promise<{ url: string }> => {
    try {
      const userId = getAuthToken();
      return await fetchAPI("/checkout", {
        method: "POST",
        body: JSON.stringify({
          userId,
          type: 'ticket',
          stationId,
          busId,
          amount,
        }),
      });
    } catch (error) {
      console.error("paymentAPI.createTicketCheckoutSession error:", error);
      throw error;
    }
  },
  
  createPassCheckoutSession: async (routeId: string, amount: number): Promise<{ url: string }> => {
    try {
      const userId = getAuthToken();
      return await fetchAPI("/checkout", {
        method: "POST",
        body: JSON.stringify({
          userId,
          type: 'pass',
          routeId,
          amount
        }),
      });
    } catch (error) {
      console.error("paymentAPI.createPassCheckoutSession error:", error);
      throw error;
    }
  },

  createWalletCheckoutSession: async (amount: number): Promise<{ url: string }> => {
    try {
      const userId = getAuthToken();
      return await fetchAPI("/checkout", {
        method: "POST",
        body: JSON.stringify({
          userId,
          type: 'wallet',
          amount
        }),
      });
    } catch (error) {
      console.error("paymentAPI.createWalletCheckoutSession error:", error);
      throw error;
    }
  },

  confirmPayment: async (sessionId: string): Promise<{ success: boolean; data?: any }> => {
    try {
      const userId = getAuthToken();
      return await fetchAPI("/payments/confirm", {
        method: "POST",
        body: JSON.stringify({
          userId,
          sessionId
        }),
      });
    } catch (error) {
      console.error("paymentAPI.confirmPayment error:", error);
      throw error;
    }
  },

  verifyPayment: async (sessionId: string): Promise<{ success: boolean; data?: any }> => {
    try {
      const userId = getAuthToken();
      return await fetchAPI("/payments/verify", {
        method: "POST",
        body: JSON.stringify({
          userId,
          sessionId
        }),
      });
    } catch (error) {
      console.error("paymentAPI.verifyPayment error:", error);
      throw error;
    }
  }
};
