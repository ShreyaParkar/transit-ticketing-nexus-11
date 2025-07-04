
import React from "react";
import { format } from "date-fns";
import { MapPin, Clock, Calendar } from "lucide-react";
import { IPass, IPassUsage } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getRouteDisplay } from "@/utils/typeGuards";

interface PassUsageListProps {
  usageHistory: IPassUsage[];
  isLoading: boolean;
  activePass: IPass;
}

export const PassUsageList: React.FC<PassUsageListProps> = ({ 
  usageHistory, 
  isLoading, 
  activePass 
}) => {
  const routeDisplay = getRouteDisplay(activePass.routeId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (usageHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No pass usage history found</p>
            <p className="text-sm mt-2">
              Your pass usage will appear here once you've used your pass
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Pass Usage History</h2>
      
      {usageHistory.map((usage) => (
        <Card key={usage._id} className="overflow-hidden">
          <div className="border-l-4 border-transit-green">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-transit-blue mr-2" />
                    <span className="font-medium">{usage.location || "Unknown location"}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{format(new Date(usage.scannedAt), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{format(new Date(usage.scannedAt), "h:mm a")}</span>
                  </div>
                </div>
                
                <div className="bg-transit-light-blue/10 px-3 py-1 rounded-full text-xs font-medium text-transit-blue">
                  {routeDisplay}
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
};
