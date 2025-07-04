
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Clock, MapPin, Navigation, Users, Search, Filter } from 'lucide-react';

interface Ride {
  _id: string;
  userId: string;
  userName: string;
  busId: string;
  busName: string;
  startLocation: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  endLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  active: boolean;
  distance?: number;
  fare?: number;
  duration?: number;
}

const AdminRideTracker = () => {
  const [activeRides, setActiveRides] = useState<Ride[]>([]);
  const [completedRides, setCompletedRides] = useState<Ride[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching rides data
  useEffect(() => {
    const fetchRides = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        // Mock active rides
        const mockActiveRides: Ride[] = [
          {
            _id: '1',
            userId: 'user1',
            userName: 'John Doe',
            busId: 'bus1',
            busName: 'Bus A101',
            startLocation: {
              latitude: 15.4909,
              longitude: 73.8278,
              timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutes ago
            },
            active: true
          },
          {
            _id: '2',
            userId: 'user2',
            userName: 'Jane Smith',
            busId: 'bus2',
            busName: 'Bus B202',
            startLocation: {
              latitude: 15.5009,
              longitude: 73.8378,
              timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString() // 8 minutes ago
            },
            active: true
          }
        ];

        // Mock completed rides
        const mockCompletedRides: Ride[] = [
          {
            _id: '3',
            userId: 'user3',
            userName: 'Bob Johnson',
            busId: 'bus1',
            busName: 'Bus A101',
            startLocation: {
              latitude: 15.4909,
              longitude: 73.8278,
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
            },
            endLocation: {
              latitude: 15.5109,
              longitude: 73.8478,
              timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString() // 1.5 hours ago
            },
            active: false,
            distance: 2.3,
            fare: 35,
            duration: 30
          }
        ];

        setActiveRides(mockActiveRides);
        setCompletedRides(mockCompletedRides);
        setIsLoading(false);
      }, 1000);
    };

    fetchRides();
  }, []);

  const filteredActiveRides = activeRides.filter(ride =>
    ride.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ride.busName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompletedRides = completedRides.filter(ride =>
    ride.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ride.busName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (timestamp: string) => {
    const now = new Date();
    const start = new Date(timestamp);
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins}m`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    }
  };

  const RideCard = ({ ride, isActive = false }: { ride: Ride; isActive?: boolean }) => (
    <Card className={`mb-4 ${isActive ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{ride.userName}</h3>
            <p className="text-sm text-muted-foreground">ID: {ride.userId.substring(0, 8)}...</p>
          </div>
          <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-500" : ""}>
            {isActive ? "Active" : "Completed"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="flex items-center text-sm">
            <Navigation className="h-4 w-4 mr-2 text-primary" />
            <span>{ride.busName}</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-primary" />
            <span>
              {isActive 
                ? `${formatDuration(ride.startLocation.timestamp)} ago`
                : `${ride.duration}m trip`
              }
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start text-sm">
            <MapPin className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium">Start</p>
              <p className="text-muted-foreground">
                {ride.startLocation.latitude.toFixed(4)}, {ride.startLocation.longitude.toFixed(4)}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(ride.startLocation.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          {ride.endLocation && (
            <div className="flex items-start text-sm">
              <MapPin className="h-4 w-4 mr-2 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium">End</p>
                <p className="text-muted-foreground">
                  {ride.endLocation.latitude.toFixed(4)}, {ride.endLocation.longitude.toFixed(4)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(ride.endLocation.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {!isActive && ride.distance && ride.fare && (
          <div className="mt-3 pt-3 border-t flex justify-between text-sm">
            <span>Distance: {ride.distance}km</span>
            <span className="font-semibold">Fare: ₹{ride.fare}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Ride Tracking Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-700">Active Rides</h3>
              <p className="text-2xl font-bold text-green-800">{activeRides.length}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-700">Completed Today</h3>
              <p className="text-2xl font-bold text-blue-800">{completedRides.length}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-700">Total Revenue</h3>
              <p className="text-2xl font-bold text-orange-800">
                ₹{completedRides.reduce((sum, ride) => sum + (ride.fare || 0), 0)}
              </p>
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user name or bus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Rides ({filteredActiveRides.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed Rides ({filteredCompletedRides.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2">Loading active rides...</p>
            </div>
          ) : filteredActiveRides.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active rides found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredActiveRides.map(ride => (
                <RideCard key={ride._id} ride={ride} isActive={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2">Loading completed rides...</p>
            </div>
          ) : filteredCompletedRides.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No completed rides found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCompletedRides.map(ride => (
                <RideCard key={ride._id} ride={ride} isActive={false} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminRideTracker;
