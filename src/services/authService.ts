
import { useAuth } from "@clerk/clerk-react";

// Hook to get authentication token and make authenticated requests
export const useAuthService = () => {
  const { getToken, isSignedIn, userId } = useAuth();

  const getAuthToken = async (): Promise<string | null> => {
    try {
      if (!isSignedIn) {
        return null;
      }
      const token = await getToken();
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };

  return {
    getAuthToken,
    makeAuthenticatedRequest,
    isAuthenticated: isSignedIn,
    userId
  };
};
