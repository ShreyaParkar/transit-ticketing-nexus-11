
import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Get auth token for API calls - improved to handle Clerk properly
export const getAuthToken = () => {
  // For client-side usage, we'll rely on the component-level auth context
  // This is a fallback for server-side or non-hook contexts
  return localStorage.getItem("userId") || localStorage.getItem("authToken");
};

// Helper function for API calls with better error handling
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  authToken?: string
): Promise<T> {
  const fallbackToken = authToken || getAuthToken();
  
  const headers = {
    "Content-Type": "application/json",
    ...(fallbackToken ? { "Authorization": `Bearer ${fallbackToken}` } : {}),
    ...(options.headers || {})
  };

  try {
    console.log(`Making API call to: ${API_URL}${endpoint}`);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error response: ${errorText}`);
      
      if (response.status === 404) {
        // For some endpoints, 404 means no data found, not an error
        if (endpoint.includes('/passes') || endpoint.includes('/trips/active')) {
          return null as T;
        }
        throw new Error(`Resource not found: ${endpoint}`);
      }
      
      if (response.status === 401) {
        console.warn('Authentication failed - token may be expired');
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (response.status === 429) {
        console.warn('Rate limit exceeded, retrying after delay...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        throw new Error('Too many requests, please try again later');
      }
      
      let error;
      try {
        error = JSON.parse(errorText);
      } catch (e) {
        error = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - server may not be running');
      throw new Error("Server is not running. Please start the backend server on port 3001.");
    }
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Hook for making authenticated API calls with Clerk
export const useAuthenticatedAPI = () => {
  const { getToken, isSignedIn } = useAuth();

  const makeAuthenticatedCall = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    if (!isSignedIn) {
      throw new Error('User not authenticated');
    }

    try {
      const token = await getToken();
      return await fetchAPI<T>(endpoint, options, token);
    } catch (error) {
      console.error('Authenticated API call failed:', error);
      throw error;
    }
  };

  return { makeAuthenticatedCall, isAuthenticated: isSignedIn };
};
