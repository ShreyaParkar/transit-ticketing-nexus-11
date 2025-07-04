
import { format } from "date-fns";
import { ITicket } from "@/types";
import { Clock, MapPin, Bus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRouteDisplay, getBusName } from "@/utils/typeGuards";

interface TicketCardProps {
  ticket: ITicket;
  className?: string;
}

export const TicketCard = ({ ticket, className }: TicketCardProps) => {
  const isExpired = new Date(ticket.expiryDate) < new Date();
  const routeDisplay = getRouteDisplay(ticket.routeId);
  const busName = getBusName(ticket.busId);

  return (
    <div className={cn("ticket-card", className, isExpired && "opacity-70")}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-medium">
            {routeDisplay}
            {isExpired && <span className="ml-2 text-sm font-normal text-red-500">(Expired)</span>}
          </h3>
          <div className="bg-transit-blue text-white px-2 py-1 rounded-full text-xs">
            ${ticket.price}
          </div>
        </div>
        
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center gap-2">
            <Bus size={16} className="text-transit-blue" />
            <span>{busName}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-transit-blue" />
            <span>
              Station: {ticket.startStation}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-transit-blue" />
            <span>
              Purchased: {format(new Date(ticket.createdAt), "MMM d, yyyy h:mm a")}
            </span>
          </div>
        </div>
      </div>
      
      <div className="ticket-divider"></div>
      
      <div className="p-4 pt-5 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            ID: {ticket._id.substring(0, 8)}
          </div>
          <div className="text-xs text-muted-foreground">
            Valid for 12 hours
          </div>
        </div>
      </div>
    </div>
  );
};
