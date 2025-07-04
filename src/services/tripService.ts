
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Rate limiting helper with longer delays
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // Increased to 2 seconds

const delayIfNeeded = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const delay = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  lastRequestTime = Date.now();
};

export const startTrip = async (userId: string, latitude: number, longitude: number, authToken: string) => {
  try {
    await delayIfNeeded();
    
    const response = await fetch(`${API_URL}/trips/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ userId, latitude, longitude }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Too many requests, please wait before trying again');
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to start trip');
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Server is not running. Please start the backend server.");
    }
    throw error;
  }
};

export const endTrip = async (tripId: string, latitude: number, longitude: number, authToken: string) => {
  try {
    await delayIfNeeded();
    
    const response = await fetch(`${API_URL}/trips/${tripId}/end`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ latitude, longitude }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Too many requests, please wait before trying again');
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to end trip');
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Server is not running. Please start the backend server.");
    }
    throw error;
  }
};

export const getActiveTrip = async (userId: string, authToken: string) => {
  try {
    await delayIfNeeded();
    
    const response = await fetch(`${API_URL}/trips/active/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      if (response.status === 429) {
        console.warn('Rate limit exceeded for active trip check');
        return null;
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to get active trip');
    }

    const data = await response.json();
    return (data && typeof data === 'object' && data.active) ? data.trip : null;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Server is not running. Please start the backend server.");
    }
    console.error('Error getting active trip:', error);
    return null;
  }
};

export const getUserTrips = async (userId: string, authToken: string) => {
  try {
    await delayIfNeeded();
    
    const response = await fetch(`${API_URL}/trips/user/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 429) {
        return [];
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to get user trips');
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Server is not running. Please start the backend server.");
    }
    console.error('Error getting user trips:', error);
    return [];
  }
};
