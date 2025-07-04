
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bus, Clock, MapPin, Activity } from 'lucide-react';
import { routesAPI, busesAPI } from "@/services/api";
import LeafletMap from "@/components/tracking/LeafletMap";
import { useTrackBuses } from "@/hooks/useTrackBuses";
import { IBus } from "@/types";
import { useToast } from "@/components/ui/use-toast";

const AdminLiveTrackingPage = () => {
  const { toast } = useToast();
  const [selectedBus, setSelectedBus] = useState<IBus | null>(null);
  
  // Fetch all routes
  const { data: routes } = useQuery({
    queryKey: ['routes'],
    queryFn: routesAPI.getAll
  });
  
  // Fetch all buses
  const { 
    data: allBuses, 
    isLoading: isLoadingBuses 
  } = useQuery({
    queryKey: ['all-buses'],
    queryFn: () => busesAPI.getAll(),
  });

  // Get all bus IDs for tracking
  const busIds = allBuses ? allBuses.map(bus => bus._id) : [];
  
  // Use our custom hook for real-time bus tracking
  const busLocations = useTrackBuses(busIds, null, allBuses, routes);
  
  // Get active buses
  const activeBuses = allBuses?.filter(bus => busLocations[bus._id]) || [];
  
  useEffect(() => {
    if (activeBuses.length > 0) {
      toast({
        title: "Admin Live Tracking",
        description: `Monitoring ${activeBuses.length} active buses across all routes.`,
        variant: "default",
      });
    }
  }, [activeBuses.length]);

  const getRouteForBus = (bus: IBus) => {
    return routes?.find(route => route._id === bus.route);
  };

  return (
    <MainLayout title="Admin Live Bus Tracking">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Admin Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Overview Stats */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-lg">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Live Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Buses</span>
                    <Badge variant="outline">{allBuses?.length || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Buses</span>
                    <Badge className="bg-green-500">{activeBuses.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Routes</span>
                    <Badge variant="outline">{routes?.length || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Buses List */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-none shadow-lg">
              <CardHeader className="pb-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Bus className="mr-2 h-5 w-5" />
                  Active Buses
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {isLoadingBuses ? (
                  <div className="space-y-2">
                    {Array(3).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : activeBuses.length === 0 ? (
                  <div className="text-center py-6">
                    <MapPin className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No active buses</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {activeBuses.map(bus => {
                      const location = busLocations[bus._id];
                      const route = getRouteForBus(bus);
                      const timeSinceUpdate = Math.round((new Date().getTime() - new Date(location.updatedAt).getTime()) / 1000);
                      const isSelected = selectedBus?._id === bus._id;
                      
                      return (
                        <div
                          key={bus._id}
                          onClick={() => setSelectedBus(bus)}
                          className={`p-3 border rounded-lg cursor-pointer transition-all
                            ${isSelected 
                              ? "border-green-500 bg-green-500 text-white shadow-md" 
                              : "hover:border-green-500 bg-white shadow-sm hover:bg-green-50"}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                              <span className="font-medium">{bus.name}</span>
                              {route && (
                                <span className="text-xs opacity-75">
                                  {route.start} → {route.end}
                                </span>
                              )}
                              <div className="flex items-center text-xs mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>
                                  {timeSinceUpdate < 60 
                                    ? `${timeSinceUpdate}s ago` 
                                    : `${Math.floor(timeSinceUpdate / 60)}m ago`}
                                </span>
                              </div>
                              {location.speed && (
                                <div className="text-xs mt-1">
                                  Speed: {Math.round(location.speed)} km/h
                                </div>
                              )}
                            </div>
                            <Badge 
                              variant={isSelected ? "secondary" : "outline"}
                              className="bg-green-100 text-green-800"
                            >
                              Live
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Map Area */}
          <Card className="lg:col-span-3 overflow-hidden border-none shadow-xl rounded-xl">
            <CardHeader className="pb-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="text-xl font-bold flex items-center">
                <MapPin className="mr-2 h-6 w-6" />
                Real-Time Bus Locations
                {activeBuses.length > 0 && (
                  <Badge className="ml-2 bg-green-500">
                    {activeBuses.length} Active
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[70vh]">
              <LeafletMap 
                buses={allBuses || []} 
                busLocations={busLocations} 
                selectedBusId={selectedBus?._id} 
                onSelectBus={(busId) => {
                  const bus = allBuses?.find(b => b._id === busId);
                  if (bus) {
                    setSelectedBus(bus);
                    const route = getRouteForBus(bus);
                    toast({
                      title: `Tracking ${bus.name}`,
                      description: route ? `Route: ${route.start} → ${route.end}` : "Bus selected for tracking",
                      duration: 3000,
                    });
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminLiveTrackingPage;
