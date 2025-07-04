
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { routesAPI, busesAPI, stationsAPI, ticketsAPI } from "@/services/api";
import { toast } from "sonner";
import { MapPin, Bus, CreditCard, Wallet, AlertTriangle } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@/services/walletService";

interface NewTicketModalProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({ open, onOpenChange }) => {
  const { userId } = useUser();
  const queryClient = useQueryClient();
  const { wallet, isLoading: isWalletLoading, deductFunds, refetchWallet } = useWallet(userId || "");
  
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [selectedBusId, setSelectedBusId] = useState("");
  const [selectedStationId, setSelectedStationId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Data
  const [routes, setRoutes] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingBuses, setLoadingBuses] = useState(false);
  const [loadingStations, setLoadingStations] = useState(false);

  // Load routes on open
  useEffect(() => {
    if (open) {
      setLoadingRoutes(true);
      routesAPI.getAll().then(r => setRoutes(r)).finally(() => setLoadingRoutes(false));
      setSelectedRouteId("");
      setSelectedBusId("");
      setSelectedStationId("");
    }
  }, [open]);

  // Load buses when route changes
  useEffect(() => {
    if (selectedRouteId) {
      setLoadingBuses(true);
      busesAPI.getAll(selectedRouteId).then(b => setBuses(b)).finally(() => setLoadingBuses(false));
      setSelectedBusId("");
      setSelectedStationId("");
    }
  }, [selectedRouteId]);

  // Load stations when bus changes
  useEffect(() => {
    if (selectedRouteId && selectedBusId) {
      setLoadingStations(true);
      stationsAPI.getAll({ routeId: selectedRouteId, busId: selectedBusId }).then(s => setStations(s)).finally(() => setLoadingStations(false));
      setSelectedStationId("");
    }
  }, [selectedBusId, selectedRouteId]);

  const selectedRoute = routes.find(r => r._id === selectedRouteId);
  const selectedBus = buses.find(b => b._id === selectedBusId);
  const selectedStation = stations.find(s => s._id === selectedStationId);
  const price = selectedStation?.fare || 0;
  const walletBalance = wallet?.balance || 0;
  const hasSufficientFunds = walletBalance >= price;

  const handleProceedToBuy = async () => {
    if (!selectedRouteId || !selectedBusId || !selectedStationId || !userId) return;

    if (!hasSufficientFunds) {
      toast.error(`Insufficient funds! You need ₹${price} but only have ₹${walletBalance.toFixed(2)}`);
      return;
    }

    try {
      setIsProcessing(true);
      toast.info("Processing ticket purchase...");

      // First, deduct funds from wallet
      await deductFunds({ 
        amount: price, 
        description: `Ticket: ${selectedStation?.name || 'Selected Station'}` 
      });

      // Create the ticket
      const response = await ticketsAPI.create({
        userId,
        routeId: selectedRouteId,
        busId: selectedBusId,
        startStation: selectedStation?.name || "Selected Station",
        endStation: selectedStation?.name || "Selected Station",
        price,
        paymentIntentId: `wallet_${Date.now()}`,
        expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      if (response.success) {
        toast.success(`Ticket purchased successfully! ₹${price} deducted from wallet.`);
        queryClient.invalidateQueries({ queryKey: ["tickets", userId] });
        await refetchWallet();
        onOpenChange(false);
      } else {
        toast.error("Failed to create ticket");
      }
    } catch (error) {
      console.error("Ticket creation error:", error);
      toast.error("Failed to purchase ticket");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] p-0 overflow-visible bg-gray-900 border-gray-700">
        <form
          className="bg-gray-900 rounded-lg shadow overflow-hidden"
          onSubmit={e => {
            e.preventDefault();
            handleProceedToBuy();
          }}>
          <DialogHeader className="bg-gradient-to-r from-blue-600/20 to-transparent px-6 py-4 border-b border-gray-700">
            <DialogTitle className="flex items-center text-lg sm:text-xl text-white">
              <MapPin className="mr-2 text-blue-400 h-5 w-5" />
              Purchase Ticket
            </DialogTitle>
            <DialogDescription className="text-gray-400">Select route, bus, and station</DialogDescription>
          </DialogHeader>
          
          <div className="p-6 space-y-4">
            {/* Wallet Balance Display */}
            <div className="p-3 bg-gray-800 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-400">
                  <Wallet className="h-4 w-4 mr-2" />
                  Wallet Balance
                </div>
                <div className="text-lg font-bold text-green-400">
                  ₹{isWalletLoading ? "..." : walletBalance.toFixed(2)}
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-white">Route</label>
              <Select value={selectedRouteId} onValueChange={setSelectedRouteId} disabled={loadingRoutes}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select a route" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {loadingRoutes ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    routes.length
                      ? routes.map(route =>
                        <SelectItem key={route._id} value={route._id} className="text-white">
                          {route.start} - {route.end}
                        </SelectItem>)
                      : <SelectItem value="none" disabled>No routes available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-white">Bus</label>
              <Select 
                value={selectedBusId} 
                onValueChange={setSelectedBusId} 
                disabled={!selectedRouteId || loadingBuses}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder={!selectedRouteId ? "Select a route first" : "Select a bus"} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {loadingBuses ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    buses.length 
                      ? buses.map(bus => 
                        <SelectItem key={bus._id} value={bus._id} className="text-white">
                          {bus.name} <Badge className="ml-2 bg-gray-700" variant="outline">cap: {bus.capacity}</Badge>
                        </SelectItem>
                      )
                      : <SelectItem value="none" disabled>No buses available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-white">Station</label>
              <Select
                value={selectedStationId}
                onValueChange={setSelectedStationId}
                disabled={!selectedBusId || loadingStations}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder={!selectedBusId ? "Select a bus first" : "Select station"} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {loadingStations ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    stations.length
                      ? stations.map(station =>
                        <SelectItem key={station._id} value={station._id} className="text-white">
                          {station.name} <Badge className="ml-2 bg-gray-700" variant="outline">₹{station.fare}</Badge>
                        </SelectItem>)
                      : <SelectItem value="none" disabled>No stations available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {price > 0 && (
              <div className="p-3 bg-gray-800 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">Ticket Price</div>
                  <div className="text-xl font-bold text-blue-400">₹{price}</div>
                </div>
                {!hasSufficientFunds && (
                  <div className="flex items-center mt-2 text-red-400 text-sm">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Insufficient wallet balance
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-700 p-4 bg-gray-800">
            <DialogClose asChild>
              <Button variant="outline" className="w-full sm:w-auto bg-gray-700 border-gray-600 text-white hover:bg-gray-600">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={!selectedRouteId || !selectedBusId || !selectedStationId || isProcessing || !hasSufficientFunds}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isProcessing ? "Processing..." : `Buy Ticket (₹${price})`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
