
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { BusLocations } from '@/types/tracking';

interface UseSocketTrackingReturn {
  busLocations: BusLocations;
  isConnected: boolean;
  error: string | null;
}

export const useSocketTracking = (): UseSocketTrackingReturn => {
  const [busLocations, setBusLocations] = useState<BusLocations>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://businn.onrender.com';
    
    console.log('🔌 Connecting to socket server:', socketUrl);
    console.log('🔧 Environment variables:', {
      VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
      VITE_API_URL: import.meta.env.VITE_API_URL
    });
    
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Socket connected successfully:', socket.id);
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('🚫 Socket connection error:', err.message);
      setError(`Connection failed: ${err.message}`);
      setIsConnected(false);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setError(null);
    });

    socket.on('reconnect_error', (err) => {
      console.error('🔄❌ Socket reconnection error:', err.message);
    });

    // Bus location updates
    socket.on('busLocationUpdate', (data: { busId: string; location: any }) => {
      console.log('📍 Bus location update received:', data);
      setBusLocations(prev => {
        const updated = {
          ...prev,
          [data.busId]: {
            ...data.location,
            latitude: data.location.latitude || data.location.lat,
            longitude: data.location.longitude || data.location.lng,
            lat: data.location.latitude || data.location.lat,
            lng: data.location.longitude || data.location.lng,
            updatedAt: new Date().toISOString()
          }
        };
        console.log('📊 Updated bus locations:', updated);
        return updated;
      });
    });

    // Bulk location updates
    socket.on('bulkLocationUpdate', (locations: BusLocations) => {
      console.log('📍📍 Bulk location update received:', locations);
      setBusLocations(locations);
    });

    // Listen for any socket events for debugging
    socket.onAny((eventName, ...args) => {
      console.log('🎧 Socket event received:', eventName, args);
    });

    // Request initial bus locations
    console.log('📤 Requesting initial bus locations...');
    socket.emit('requestBusLocations');

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket connection');
      socket.disconnect();
    };
  }, []);

  return {
    busLocations,
    isConnected,
    error
  };
};
