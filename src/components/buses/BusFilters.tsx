
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Route } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { IRoute } from "@/types";

interface BusFiltersProps {
  routes: IRoute[] | undefined;
  isLoadingRoutes: boolean;
  selectedRouteId: string;
  onRouteFilter: (routeId: string) => void;
}

const BusFilters: React.FC<BusFiltersProps> = ({
  routes,
  isLoadingRoutes,
  selectedRouteId,
  onRouteFilter
}) => {
  return (
    <Card className="md:col-span-1 bg-gradient-to-br from-card to-background border-transit-orange/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-transit-orange flex items-center neonText">
          <Route className="mr-2 h-5 w-5" /> 
          Filter by Route
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {isLoadingRoutes ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))
          ) : routes?.map(route => (
            <div
              key={route._id}
              onClick={() => onRouteFilter(route._id)}
              className={`p-3 border rounded-lg cursor-pointer transition-all flex justify-between items-center
                ${selectedRouteId === route._id 
                  ? "border-transit-orange bg-transit-orange/20 text-white shadow-md" 
                  : "hover:border-transit-orange/50 bg-background/50 border-border shadow-sm hover:bg-transit-orange/5"}`}
            >
              <span className="font-medium">{route.start} - {route.end}</span>
              <Badge variant={selectedRouteId === route._id ? "secondary" : "outline"} 
                className={selectedRouteId === route._id ? "bg-transit-orange/30 text-white border-transit-orange/30" : ""}>
                ₹{route.fare}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BusFilters;
