
import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { QrCode } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface UserQRCodeProps {
  size?: number;
  showLabel?: boolean;
  className?: string;
}

const UserQRCode: React.FC<UserQRCodeProps> = ({ 
  size = 200, 
  showLabel = true,
  className = ""
}) => {
  const { userId, userDetails } = useUser();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) return;
    
    const generateQR = async () => {
      try {
        setIsLoading(true);
        
        // Create QR data with user information and current timestamp
        const qrData = JSON.stringify({
          userId: userId,
          type: 'transit_ticket',
          timestamp: Date.now(),
          version: '1.0'
        });
        
        // Use QR Server API to generate QR code
        const encodedData = encodeURIComponent(qrData);
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&color=F97316&bgcolor=FFFFFF&qzone=2`;
        
        setQrCodeUrl(url);
      } catch (error) {
        console.error("Error generating QR code:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    generateQR();
  }, [userId, size]);
  
  if (!userId) {
    return (
      <Card className={`w-full bg-gradient-to-br from-white to-blue-50 shadow-md ${className}`}>
        <CardContent className="p-4 text-center">
          <p className="text-muted-foreground text-sm">Please login to view your QR code</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`w-full bg-white border-primary shadow-md ${className}`}>
      <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-6 sm:py-8">
            <QrCode className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground animate-pulse" />
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">Generating QR code...</p>
          </div>
        ) : (
          <>
            <div className="bg-white p-2 rounded-lg shadow-sm border">
              <img 
                src={qrCodeUrl} 
                alt="User QR Code" 
                className="w-full h-auto rounded max-w-[180px] sm:max-w-[200px]"
                style={{ width: size, height: size }}
              />
            </div>
            
            {showLabel && (
              <div className="mt-3 sm:mt-4 text-center space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Scan to check-in/out</p>
                <p className="text-xs text-muted-foreground">ID: {userId.substring(0, 8)}...</p>
                {userDetails?.firstName && (
                  <p className="text-sm font-medium text-primary">
                    {userDetails.firstName} {userDetails.lastName}
                  </p>
                )}
                <div className="mt-2 px-2 py-1 bg-primary/10 rounded-full">
                  <p className="text-xs text-primary font-medium">Valid Transit Pass</p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserQRCode;
