
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routesAPI } from "@/services/api";
import { IRoute } from "@/types";
import { Bus, MapPin } from "lucide-react";

interface RouteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  route: IRoute | null;
}

const RouteForm: React.FC<RouteFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  route
}) => {
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState({
    id: route?._id || "",
    start: route?.start || "",
    end: route?.end || "",
    fare: route?.fare || 0,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<IRoute, "_id">) => routesAPI.create(data),
    onSuccess: () => {
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      toast.success("Route created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: IRoute) => routesAPI.update(data),
    onSuccess: () => {
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      toast.success("Route updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: name === "fare" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (route) {
      updateMutation.mutate({
        _id: formValues.id,
        start: formValues.start,
        end: formValues.end,
        fare: formValues.fare,
      });
    } else {
      createMutation.mutate({
        start: formValues.start,
        end: formValues.end,
        fare: formValues.fare,
      });
    }
  };

  const isFormValid = () => {
    return (
      formValues.start.trim() !== "" &&
      formValues.end.trim() !== "" &&
      formValues.fare > 0
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary neonText">
            <MapPin className="h-5 w-5" />
            {route ? "Edit Route" : "Add New Route"}
          </DialogTitle>
          <DialogDescription>
            {route
              ? "Update the details for this route."
              : "Enter the details for the new route."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="start">Starting Point</Label>
              <Input
                id="start"
                name="start"
                value={formValues.start}
                onChange={handleChange}
                placeholder="Enter starting point"
                className="border-muted bg-background/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end">Destination</Label>
              <Input
                id="end"
                name="end"
                value={formValues.end}
                onChange={handleChange}
                placeholder="Enter destination"
                className="border-muted bg-background/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fare">Fare (₹)</Label>
              <Input
                id="fare"
                name="fare"
                type="number"
                min="0"
                step="0.01"
                value={formValues.fare}
                onChange={handleChange}
                placeholder="Enter fare amount"
                className="border-muted bg-background/50"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/80 text-primary-foreground"
              disabled={!isFormValid() || createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                "Saving..."
              ) : route ? (
                "Update Route"
              ) : (
                "Add Route"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RouteForm;
