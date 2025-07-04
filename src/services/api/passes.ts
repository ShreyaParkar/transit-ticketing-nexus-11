
import { IPass, IPassUsage } from "@/types";
import { fetchAPI, getAuthToken } from "./base";

// Passes API
export const passesAPI = {
  getActivePass: (): Promise<IPass> => {
    const userId = getAuthToken();
    return fetchAPI(`/passes?userId=${userId}`);
  },

  getByUserId: (userId: string): Promise<IPass[]> => {
    if (!userId) {
      return Promise.resolve([]);
    }
    return fetchAPI(`/passes?userId=${userId}`);
  },
    
  createPass: (pass: { routeId: string; fare: number; sessionId: string }): Promise<{ success: boolean; pass: IPass }> => {
    const userId = getAuthToken();
    return fetchAPI("/passes", {
      method: "POST",
      body: JSON.stringify({ ...pass, userId }),
    });
  },

  validatePass: (data: { qrData: string; location: string }): Promise<{ valid: boolean; pass?: IPass; message?: string }> => {
    return fetchAPI("/passes/validate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
    
  confirmPassPayment: (sessionId: string): Promise<{ success: boolean; pass: IPass }> => {
    const userId = getAuthToken();
    return fetchAPI("/payments", {
      method: "POST",
      body: JSON.stringify({ sessionId, userId }),
    });
  },
    
  getPassUsage: (): Promise<IPassUsage[]> => {
    const userId = getAuthToken();
    return fetchAPI(`/pass-usage?userId=${userId}`);
  },
    
  recordPassUsage: (passId: string, location: string): Promise<{ message: string; usage: IPassUsage }> =>
    fetchAPI("/pass-usage", {
      method: "POST",
      body: JSON.stringify({ passId, location }),
    }),
};
