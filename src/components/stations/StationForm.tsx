
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, MapPin } from "lucide-react";
import { stationsAPI, busesAPI, routesAPI } from "@/services/api";
import { toast } from "sonner";
import { IStation, IBus, IRoute } from "@/types";
import { getRouteId, getBusId } from "@/utils/typeGuards";

interface StationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  station?: IStation | null;
  selectedRouteId: string;
}

const StationForm: React.FC<StationFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  station,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    routeId: "",
    busId: "",
    latitude: "",
    longitude: "",
    fare: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [buses, setBuses] = useState<IBus[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingBuses, setLoadingBuses] = useState(false);

  // Load routes
  useEffect(() => {
    if (isOpen) {
      setLoadingRoutes(true);
      routesAPI.getAll()
        .then(setRoutes)
        .catch(error => {
          console.error("Error loading routes:", error);
          toast.error("Failed to load routes");
        })
        .finally(() => setLoadingRoutes(false));
    }
  }, [isOpen]);

  // Load buses when route changes
  useEffect(() => {
    if (formData.routeId) {
      setLoadingBuses(true);
      busesAPI.getAll(formData.routeId)
        .then(setBuses)
        .catch(error => {
          console.error("Error loading buses:", error);
          toast.error("Failed to load buses");
        })
        .finally(() => setLoadingBuses(false));
    } else {
      setBuses([]);
    }
  }, [formData.routeId]);

  // Reset form when modal opens/closes or station changes
  useEffect(() => {
    if (isOpen) {
      if (station) {
        // Pre-fill form with station data for editing
        const routeId = getRouteId(station.routeId);
        const busId = getBusId(station.busId);
        
        setFormData({
          name: station.name || "",
          routeId: routeId || "",
          busId: busId || "",
          latitude: station.latitude?.toString() || "",
          longitude: station.longitude?.toString() || "",
          fare: station.fare?.toString() || "",
        });
      } else {
        // Clear form for new station
        setFormData({
          name: "",
          routeId: "",
          busId: "",
          latitude: "",
          longitude: "",
          fare: "",
        });
      }
    }
  }, [isOpen, station]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const stationData = {
        name: formData.name,
        routeId: formData.routeId,
        busId: formData.busId,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        fare: parseFloat(formData.fare),
        location: formData.name,
      };

      if (station) {
        await stationsAPI.update({ ...stationData, _id: station._id });
        toast.success("Station updated successfully");
      } else {
        await stationsAPI.create(stationData);
        toast.success("Station created successfully");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving station:", error);
      toast.error("Failed to save station");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="bg-gradient-to-r from-blue-600/20 to-transparent border-b border-gray-700">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-white">
            <MapPin className="mr-2 h-5 w-5 text-blue-400" />
            {station ? "Edit Station" : "Add New Station"}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">Station Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Enter station name"
            />
          </div>

          <div>
            <Label htmlFor="routeId" className="text-white">Route</Label>
            <Select 
              value={formData.routeId} 
              onValueChange={(value) => setFormData({ ...formData, routeId: value, busId: "" })}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select a route" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {loadingRoutes ? (
                  <SelectItem value="loading" disabled>Loading routes...</SelectItem>
                ) : routes.length > 0 ? (
                  routes.map((route) => (
                    <SelectItem key={route._id} value={route._id} className="text-white">
                      {route.start} - {route.end}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No routes available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="busId" className="text-white">Bus</Label>
            <Select 
              value={formData.busId} 
              onValueChange={(value) => setFormData({ ...formData, busId: value })}
              disabled={!formData.routeId}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder={!formData.routeId ? "Select a route first" : "Select a bus"} />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {loadingBuses ? (
                  <SelectItem value="loading" disabled>Loading buses...</SelectItem>
                ) : buses.length > 0 ? (
                  buses.map((bus) => (
                    <SelectItem key={bus._id} value={bus._id} className="text-white">
                      {bus.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No buses available for this route</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude" className="text-white">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                required
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="0.000000"
              />
            </div>
            <div>
              <Label htmlFor="longitude" className="text-white">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                required
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="0.000000"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="fare" className="text-white">Fare (₹)</Label>
            <Input
              id="fare"
              type="number"
              step="0.01"
              value={formData.fare}
              onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
              required
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="0.00"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Saving..." : station ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StationForm;
