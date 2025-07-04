
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, Clock, MapPin, Users, Wifi, AlertTriangle } from 'lucide-react';
import { IBus, IRoute } from '@/types';
import { BusLocation } from '@/types/tracking';

interface BusInfoPanelProps {
  bus: IBus;
  location: BusLocation;
  route?: IRoute;
}

const BusInfoPanel: React.FC<BusInfoPanelProps> = ({ bus, location, route }) => {
  // Calculate minutes since last update
  const minutesSinceUpdate = Math.floor((new Date().getTime() - new Date(location.updatedAt).getTime()) / 60000);
  
  // Status based on time since update
  const getStatusBadge = () => {
    if (minutesSinceUpdate < 2) {
      return <Badge className="bg-transit-green text-white">Live</Badge>;
    } else if (minutesSinceUpdate < 5) {
      return <Badge className="bg-transit-orange text-white">Active</Badge>;
    } else {
      return <Badge variant="outline" className="text-transit-red border-transit-red">Delayed</Badge>;
    }
  };
  
  // Direction based on heading
  const getDirectionFromHeading = (heading?: number) => {
    if (heading === undefined) return "Unknown";
    
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(((heading % 360) / 45)) % 8;
    return directions[index];
  };
  
  // Format speed
  const formatSpeed = (speed?: number) => {
    if (speed === undefined) return "Unknown";
    return `${Math.round(speed)} km/h`;
  };
  
  // Simulated ETA calculation based on speed and distance
  const calculateETA = () => {
    if (!route) return Math.floor(Math.random() * 30) + 5;
    
    const speed = location.speed || 30; // km/h
    const distanceRemaining = Math.random() * 10; // Random distance 0-10 km for demo
    
    // Time = distance / speed (hours) * 60 (minutes)
    return Math.max(1, Math.round((distanceRemaining / speed) * 60));
  };

  return (
    <Card className="bg-gradient-to-br from-white to-blue-50 shadow-lg">
      <CardHeader className="pb-3 bg-gradient-to-r from-transit-orange to-transit-orange-dark text-white">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <div className="flex items-center">
            <Navigation className="mr-2 h-5 w-5" />
            {bus.name}
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-3">
          <li className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
            <div className="flex items-center text-sm">
              <MapPin className="mr-2 h-4 w-4 text-transit-orange" />
              <span>Current Location</span>
            </div>
            <span className="text-xs font-mono bg-gray-100 p-1 rounded">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
          </li>
          
          <li className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
            <div className="flex items-center text-sm">
              <Navigation className="mr-2 h-4 w-4 text-transit-orange" />
              <span>Direction</span>
            </div>
            <div className="flex items-center">
              <Badge variant="outline" className="bg-transit-orange/10 text-transit-orange border-transit-orange">
                {getDirectionFromHeading(location.heading)}
              </Badge>
            </div>
          </li>
          
          <li className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
            <div className="flex items-center text-sm">
              <Navigation className="mr-2 h-4 w-4 text-transit-orange transform rotate-45" />
              <span>Speed</span>
            </div>
            <div className="flex items-center">
              <Badge variant="outline" className="bg-transit-orange/10 text-transit-orange border-transit-orange">
                {formatSpeed(location.speed)}
              </Badge>
            </div>
          </li>

          <li className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
            <div className="flex items-center text-sm">
              <Clock className="mr-2 h-4 w-4 text-transit-orange" />
              <span>Last Updated</span>
            </div>
            <div className="flex items-center">
              {minutesSinceUpdate < 1 ? (
                <Badge variant="outline" className="bg-transit-green/10 text-transit-green border-transit-green">Just now</Badge>
              ) : minutesSinceUpdate < 5 ? (
                <Badge variant="outline" className="bg-transit-orange/10 text-transit-orange border-transit-orange">{minutesSinceUpdate} min ago</Badge>
              ) : (
                <Badge variant="outline" className="bg-transit-red/10 text-transit-red border-transit-red">{minutesSinceUpdate} min ago</Badge>
              )}
            </div>
          </li>

          <li className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
            <div className="flex items-center text-sm">
              <Wifi className="mr-2 h-4 w-4 text-transit-orange" />
              <span>Signal Strength</span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({length: 4}).map((_, i) => (
                <div 
                  key={i}
                  className={`h-3 w-1 rounded-sm ${
                    minutesSinceUpdate < i + 1 
                      ? 'bg-transit-green' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </li>

          <li className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
            <div className="flex items-center text-sm">
              <Users className="mr-2 h-4 w-4 text-transit-orange" />
              <span>Capacity</span>
            </div>
            <div className="flex items-center">
              <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                <div 
                  className="h-2 bg-transit-orange rounded-full" 
                  style={{ width: `${Math.floor(Math.random() * 80) + 10}%` }}
                ></div>
              </div>
              <span className="text-xs">{bus.capacity} seats</span>
            </div>
          </li>

          {route && (
            <>
              <li className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 text-transit-green" />
                  <span>Start</span>
                </div>
                <span className="text-xs font-medium">{route.start}</span>
              </li>
              
              <li className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 text-transit-red" />
                  <span>End</span>
                </div>
                <span className="text-xs font-medium">{route.end}</span>
              </li>

              <li className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-transit-orange" />
                  <span>ETA</span>
                </div>
                <Badge className="bg-transit-orange">{calculateETA()} min</Badge>
              </li>
            </>
          )}
          
          <li className="mt-2">
            <div className="text-xs text-center text-muted-foreground">
              {minutesSinceUpdate > 10 && (
                <div className="flex items-center justify-center text-transit-red gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Location data may be outdated</span>
                </div>
              )}
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default BusInfoPanel;
