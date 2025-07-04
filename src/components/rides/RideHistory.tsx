
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { IRide } from "@/types";

interface RideHistoryProps {
  rides: IRide[];
}

const RideHistory: React.FC<RideHistoryProps> = ({ rides }) => {
  if (!rides || rides.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No ride history found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {rides.map((ride) => (
        <Card key={ride._id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                {ride.busName}
              </div>
              <Badge variant={ride.active ? "default" : "secondary"}>
                {ride.active ? "Active" : "Completed"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center text-sm">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(ride.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
            </div>
            {ride.duration && (
              <div className="flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{Math.round(ride.duration / 60)} minutes</span>
              </div>
            )}
            {ride.fare && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Fare:</span>
                <span className="font-medium">₹{ride.fare}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RideHistory;
