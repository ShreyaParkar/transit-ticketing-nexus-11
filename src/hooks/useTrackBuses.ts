
import { useState, useEffect, useMemo } from 'react';
import { IBus, IRoute } from '@/types';
import { BusLocations } from '@/types/tracking';
import { BUS_ROUTES } from '@/data/busRoutes';

export const useTrackBuses = (busIds: string[], routeId: string | null, allBuses?: IBus[] | null, allRoutes?: IRoute[] | null): BusLocations => {
  const [busLocations, setBusLocations] = useState<BusLocations>({});
  const [busRouteProgress, setBusRouteProgress] = useState<{ [busId: string]: number }>({});

  // Memoize the busIds array to prevent unnecessary re-renders
  const stableBusIds = useMemo(() => busIds, [JSON.stringify(busIds)]);
  
  // Memoize the route data to prevent unnecessary re-renders
  const stableRoutes = useMemo(() => allRoutes, [JSON.stringify(allRoutes)]);
  const stableBuses = useMemo(() => allBuses, [JSON.stringify(allBuses)]);

  useEffect(() => {
    console.log('=== LIVE TRACKING INITIALIZED ===');
    console.log('Bus IDs to track:', stableBusIds, 'on route:', routeId);
    
    if (stableBusIds.length === 0) {
      console.log('No bus IDs provided for tracking');
      setBusLocations({});
      return;
    }

    console.log('Starting realistic bus tracking for IDs:', stableBusIds);

    // Initialize route progress for each bus
    const initialProgress: { [busId: string]: number } = {};
    stableBusIds.forEach((busId) => {
      initialProgress[busId] = Math.random() * 0.5; // Start buses at different points
    });
    setBusRouteProgress(initialProgress);

    const interval = setInterval(() => {
      console.log('=== UPDATING BUS LOCATIONS ===');
      const timestamp = new Date().toISOString();
      const newLocations: BusLocations = {};
      
      setBusRouteProgress(prevProgress => {
        const updatedProgress = { ...prevProgress };
        
        stableBusIds.forEach((busId, index) => {
          const routeKeys = Object.keys(BUS_ROUTES);
          let routeKey: keyof typeof BUS_ROUTES;
          
          const bus = stableBuses?.find(b => b._id === busId);
          const busRouteId = bus?.route ? (typeof bus.route === 'string' ? bus.route : bus.route._id) : null;

          const effectiveRouteId = routeId || busRouteId;

          if (effectiveRouteId && stableRoutes && stableRoutes.length > 0) {
            const route = stableRoutes.find(r => r._id === effectiveRouteId);
            if (route) {
                const start = route.start.toLowerCase();
                const end = route.end.toLowerCase();
                
                if (start.includes('margao') || end.includes('margao')) {
                    routeKey = 'route2'; // Margao -> Ponda -> Panaji
                } else if (start.includes('mapusa') || end.includes('mapusa')) {
                    routeKey = 'route3'; // Mapusa -> Calangute -> Baga
                } else if (start.includes('panjim') || end.includes('panjim') || start.includes('panaji') || end.includes('panaji')) {
                    routeKey = 'route1'; // Panaji -> Dona Paula -> Calangute
                } else {
                    // Fallback to hashing if no keywords match
                    const hash = Array.from(effectiveRouteId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    routeKey = routeKeys[hash % routeKeys.length] as keyof typeof BUS_ROUTES;
                }
            } else {
              // Fallback if route not found in allRoutes
              const hash = Array.from(effectiveRouteId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
              routeKey = routeKeys[hash % routeKeys.length] as keyof typeof BUS_ROUTES;
            }
          } else if (effectiveRouteId) {
            // Fallback for when allRoutes is not provided
            const hash = Array.from(effectiveRouteId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
            routeKey = routeKeys[hash % routeKeys.length] as keyof typeof BUS_ROUTES;
          } else {
            // Fallback for when no route is identified at all
            routeKey = routeKeys[index % routeKeys.length] as keyof typeof BUS_ROUTES;
          }
          
          const route = BUS_ROUTES[routeKey];
          
          // Get current progress for this bus
          let progress = updatedProgress[busId] || 0;
          
          // Increment progress (simulate bus movement along route)
          progress += 0.002 + (Math.random() * 0.003); // Variable speed
          
          // Reset progress if bus completes route
          if (progress >= 1) {
            progress = 0;
            console.log(`Bus ${busId} completed route, starting new journey`);
          }
          
          updatedProgress[busId] = progress;
          
          // Calculate position based on progress along route
          const segmentCount = route.length - 1;
          const segmentProgress = progress * segmentCount;
          const currentSegment = Math.floor(segmentProgress);
          const segmentRatio = segmentProgress - currentSegment;
          
          // Interpolate between current and next waypoint
          const startPoint = route[Math.min(currentSegment, route.length - 1)];
          const endPoint = route[Math.min(currentSegment + 1, route.length - 1)];
          
          const lat = startPoint.lat + (endPoint.lat - startPoint.lat) * segmentRatio;
          const lng = startPoint.lng + (endPoint.lng - startPoint.lng) * segmentRatio;
          
          // Add small random variation for realism
          const latVariation = (Math.random() - 0.5) * 0.0005;
          const lngVariation = (Math.random() - 0.5) * 0.0005;
          
          const finalLat = lat + latVariation;
          const finalLng = lng + lngVariation;
          
          // Calculate realistic speed and heading
          const speed = 20 + Math.random() * 25; // 20-45 km/h
          const heading = Math.atan2(endPoint.lng - startPoint.lng, endPoint.lat - startPoint.lat) * 180 / Math.PI;
          
          const locationUpdate = {
            latitude: finalLat,
            longitude: finalLng,
            lat: finalLat,
            lng: finalLng,
            speed: speed,
            heading: heading < 0 ? heading + 360 : heading,
            updatedAt: new Date().toISOString()
          };
          
          newLocations[busId] = locationUpdate;
          
          console.log(`Bus ${busId} location updated:`, {
            busId,
            route: routeKey,
            progress: (progress * 100).toFixed(1) + '%',
            currentSegment: `${startPoint.name} → ${endPoint.name}`,
            lat: finalLat.toFixed(6),
            lng: finalLng.toFixed(6),
            speed: speed.toFixed(1) + ' km/h',
            heading: heading.toFixed(0) + '°',
            timestamp
          });
        });
        
        return updatedProgress;
      });
      
      setBusLocations(prevLocations => {
        console.log('Previous locations count:', Object.keys(prevLocations).length);
        console.log('New locations count:', Object.keys(newLocations).length);
        return newLocations;
      });
    }, 5000); // Increased interval to 5 seconds to reduce API calls

    return () => {
      console.log('=== STOPPING LIVE TRACKING ===');
      console.log('Clearing tracking interval for buses:', stableBusIds);
      clearInterval(interval);
    };
  }, [stableBusIds, routeId, stableBuses, stableRoutes]);

  return busLocations;
};
