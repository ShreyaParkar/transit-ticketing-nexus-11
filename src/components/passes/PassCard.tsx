
import { format } from "date-fns";
import { IPass } from "@/types";
import { Calendar, Clock, MapPin, Ticket, Bus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRouteDisplay } from "@/utils/typeGuards";

interface PassCardProps {
  pass: IPass;
  className?: string;
}

export const PassCard = ({ pass, className }: PassCardProps) => {
  const isExpired = new Date(pass.expiryDate) < new Date();
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(pass.expiryDate).getTime() - new Date().getTime()) / 
      (1000 * 3600 * 24)
    )
  );
  const routeDisplay = getRouteDisplay(pass.routeId);

  return (
    <div className={cn(
      "bg-gradient-to-r from-transit-blue to-transit-light-blue rounded-lg p-6 text-white shadow-lg relative overflow-hidden", 
      className,
      isExpired && "from-gray-500 to-gray-600"
    )}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-white blur-3xl"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <Ticket className="h-6 w-6 mr-2" />
            <h3 className="text-xl font-bold">Monthly Pass</h3>
          </div>
          <div className="bg-white text-transit-blue px-3 py-1 rounded-full font-medium flex items-center">
            <span className="mr-1">₹</span>{pass.fare}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bus size={18} className="text-white opacity-90" />
            <span className="text-lg">
              {routeDisplay}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-white opacity-90" />
            <span>
              Valid from: {format(new Date(pass.purchaseDate), "MMM d, yyyy")}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-white opacity-90" />
            <span>
              Expires: {format(new Date(pass.expiryDate), "MMM d, yyyy")}
            </span>
          </div>
        </div>
        
        {!isExpired ? (
          <div className="mt-6 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3">
            <div className="text-sm opacity-90">Valid for</div>
            <div className="text-2xl font-bold">{daysLeft} days remaining</div>
          </div>
        ) : (
          <div className="mt-6 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3">
            <div className="text-xl font-bold">EXPIRED</div>
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-xs opacity-75">
            Pass ID: {pass._id.substring(0, 8)}
          </div>
          
          <div className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
            {isExpired ? 'Renewal required' : 'Active'}
          </div>
        </div>
      </div>
    </div>
  );
};
