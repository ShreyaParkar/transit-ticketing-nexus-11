
import { IRoute } from "@/types";
import { fetchAPI } from "./base";

// Routes API
export const routesAPI = {
  getAll: async (): Promise<IRoute[]> => {
    return fetchAPI("/routes");
  },
  
  create: async (route: Omit<IRoute, "_id">): Promise<IRoute> => {
    return fetchAPI("/routes", {
      method: "POST",
      body: JSON.stringify(route),
    });
  },
    
  update: async (route: IRoute): Promise<IRoute> => {
    return fetchAPI(`/routes/${route._id}`, {
      method: "PUT",
      body: JSON.stringify(route),
    });
  },
    
  delete: async (id: string): Promise<{ message: string }> => {
    return fetchAPI(`/routes/${id}`, {
      method: "DELETE",
    });
  },
};
