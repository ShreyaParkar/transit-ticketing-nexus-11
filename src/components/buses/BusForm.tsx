
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { routesAPI, busesAPI } from "@/services/api";
import { IBus, IRoute } from "@/types";
import { getRouteId } from "@/utils/typeGuards";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bus } from "lucide-react";

interface BusFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bus: IBus | null;
  selectedRouteId: string;
}

const BusForm: React.FC<BusFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  bus, 
  selectedRouteId 
}) => {
  const [name, setName] = useState(bus?.name || "");
  const [routeId, setRouteId] = useState(
    bus ? getRouteId(bus.route) : selectedRouteId
  );
  const [capacity, setCapacity] = useState(bus?.capacity || 50);

  const queryClient = useQueryClient();

  const { data: routes, isLoading: isLoadingRoutes } = useQuery({
    queryKey: ["routes"],
    queryFn: routesAPI.getAll,
  });

  const createBusMutation = useMutation({
    mutationFn: busesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create bus");
    },
  });

  const updateBusMutation = useMutation({
    mutationFn: busesAPI.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update bus");
    },
  });

  useEffect(() => {
    if (bus) {
      setName(bus.name);
      setRouteId(getRouteId(bus.route));
      setCapacity(bus.capacity);
    } else {
      setName("");
      setRouteId(selectedRouteId);
      setCapacity(50);
    }
  }, [bus, selectedRouteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !routeId || !capacity) {
      toast.error("Please fill in all fields.");
      return;
    }

    const busData = {
      name,
      route: routeId,
      capacity: Number(capacity),
    };

    if (bus) {
      updateBusMutation.mutate({ ...bus, ...busData });
    } else {
      createBusMutation.mutate(busData);
    }
  };

  const isFormValid = () => {
    return name.trim() !== "" && routeId !== "" && capacity > 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary neonText">
            <Bus className="h-5 w-5" />
            {bus ? "Edit Bus" : "Add New Bus"}
          </DialogTitle>
          <DialogDescription>
            {bus
              ? "Update the details for this bus."
              : "Enter the details for the new bus."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Bus Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter bus name"
              className="border-muted bg-background/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="route">Route</Label>
            <Select value={routeId} onValueChange={setRouteId}>
              <SelectTrigger className="border-muted bg-background/50">
                <SelectValue placeholder="Select a route" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingRoutes ? (
                  <SelectItem value="loading" disabled>
                    Loading routes...
                  </SelectItem>
                ) : (
                  routes?.map((route) => (
                    <SelectItem key={route._id} value={route._id}>
                      {route.start} - {route.end}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              placeholder="Enter seat capacity"
              className="border-muted bg-background/50"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/80 text-white"
              disabled={!isFormValid() || createBusMutation.isPending || updateBusMutation.isPending}
            >
              {createBusMutation.isPending || updateBusMutation.isPending ? (
                "Saving..."
              ) : bus ? (
                "Update Bus"
              ) : (
                "Add Bus"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BusForm;
