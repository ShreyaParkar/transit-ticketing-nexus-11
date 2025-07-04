
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { Ticket, Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { IPass } from "@/types";

interface PassQRCodeProps {
  activePass: IPass;
}

const PassQRCode: React.FC<PassQRCodeProps> = ({ activePass }) => {
  const isExpired = new Date(activePass.expiryDate) < new Date();
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(activePass.expiryDate).getTime() - new Date().getTime()) / 
      (1000 * 3600 * 24)
    )
  );

  // Generate QR code data with pass information
  const qrData = JSON.stringify({
    type: "pass",
    passId: activePass._id,
    userId: activePass.userId,
    expiryDate: activePass.expiryDate,
    routeId: typeof activePass.routeId === 'object' ? activePass.routeId._id : activePass.routeId,
  });

  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-card-foreground">
          <div className="flex items-center">
            <Ticket className="mr-2 h-5 w-5 text-primary" />
            Monthly Pass QR Code
          </div>
          <Badge 
            variant={isExpired ? "destructive" : "default"} 
            className={isExpired ? "" : "bg-green-100 text-green-800 border-green-300"}
          >
            {isExpired ? "Expired" : "Active"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code */}
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-lg">
            <QRCodeSVG
              value={qrData}
              size={200}
              level="M"
              includeMargin={true}
            />
          </div>
        </div>

        {/* Pass Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Route:</span>
            <span className="font-medium text-card-foreground">
              {typeof activePass.routeId === 'object' && activePass.routeId 
                ? `${activePass.routeId.start} → ${activePass.routeId.end}`
                : 'Route Information'
              }
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Fare:</span>
            <span className="font-medium text-card-foreground">₹{activePass.fare}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Expires:</span>
            <span className="font-medium text-card-foreground">
              {format(new Date(activePass.expiryDate), "MMM d, yyyy")}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Usage Count:</span>
            <span className="font-medium text-primary">{activePass.usageCount || 0} times</span>
          </div>

          {!isExpired && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Days remaining:</span>
              <span className="font-medium text-primary">{daysLeft} days</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            <Calendar className="inline h-4 w-4 mr-2" />
            Show this QR code to bus staff for automatic pass validation and usage tracking.
          </p>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-800">
            <strong>How it works:</strong> This QR code will be automatically validated when scanned. 
            Usage will be recorded and you'll see confirmation. No manual check-in/out needed for pass holders.
          </p>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Pass ID: {activePass._id.substring(0, 8)}...
        </div>
      </CardContent>
    </Card>
  );
};

export default PassQRCode;
