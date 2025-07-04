
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Navigation, TicketX } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { ticketsAPI } from "@/services/api";
import { ITicket } from "@/types";
import { format } from "date-fns";

const ActiveTicketDisplay: React.FC = () => {
  const { userId } = useUser();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets", userId],
    queryFn: () => ticketsAPI.getByUserId(userId || ""),
    enabled: !!userId,
  });

  // Filter for active tickets only
  const activeTickets = Array.isArray(tickets) 
    ? tickets.filter((ticket: ITicket) => new Date(ticket.expiryDate) > new Date())
    : [];

  if (isLoading) {
    return (
      <Card className="bg-card border-border shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-card-foreground">
            <Navigation className="mr-2 h-5 w-5 text-primary" />
            Active Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-2 text-muted-foreground">Loading tickets...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeTickets.length === 0) {
    return (
      <Card className="bg-card border-border shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-card-foreground">
            <Navigation className="mr-2 h-5 w-5 text-primary" />
            Active Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TicketX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1 text-card-foreground">No Active Tickets</h3>
            <p className="text-muted-foreground">
              You don't have any active tickets at the moment
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-card-foreground">
          <Navigation className="mr-2 h-5 w-5 text-primary" />
          Active Tickets ({activeTickets.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activeTickets.map((ticket: ITicket) => (
            <Card key={ticket._id} className="bg-secondary/50 border-border shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-card-foreground">
                      {typeof ticket.routeId === 'object' && ticket.routeId 
                        ? `${ticket.routeId.start} → ${ticket.routeId.end}`
                        : 'Route Information'
                      }
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Bus: {typeof ticket.busId === 'object' && ticket.busId 
                        ? ticket.busId.name 
                        : 'Bus Information'
                      }
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    ₹{ticket.price}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">
                      Station: {ticket.startStation}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">
                      Valid until: {format(new Date(ticket.expiryDate), "MMM d, yyyy h:mm a")}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    Ticket ID: {ticket._id.substring(0, 8)}...
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveTicketDisplay;
