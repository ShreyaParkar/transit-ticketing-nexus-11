
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { stationsAPI, busesAPI } from "@/services/api";
import { IStation, IBus } from "@/types";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StationTable from "@/components/stations/StationTable";
import StationForm from "@/components/stations/StationForm";

const StationManagementPage = () => {
  const [selectedStation, setSelectedStation] = useState<IStation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: stations = [], isLoading: stationsLoading, refetch: refetchStations } = useQuery({
    queryKey: ["stations"],
    queryFn: () => stationsAPI.getAll(),
  });

  const { data: buses = [] } = useQuery({
    queryKey: ["buses"],
    queryFn: () => busesAPI.getAll(),
  });

  const handleEdit = (station: IStation) => {
    setSelectedStation(station);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await stationsAPI.delete(id);
      refetchStations();
    } catch (error) {
      console.error("Error deleting station:", error);
    }
  };

  const handleAdd = () => {
    setSelectedStation(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedStation(null);
    refetchStations();
  };

  return (
    <MainLayout title="Station Management">
      <div className="max-w-7xl mx-auto p-6 bg-background min-h-screen">
        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/10 border-b border-border">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-card-foreground">
                Station Management
              </CardTitle>
              <Button 
                onClick={handleAdd} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Station
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 bg-card">
            {stationsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                <span className="ml-3 text-muted-foreground">Loading stations...</span>
              </div>
            ) : (
              <StationTable
                stations={stations}
                buses={buses}
                isLoading={stationsLoading}
                onAddStation={handleAdd}
                onEditStation={handleEdit}
                onDeleteStation={handleDelete}
                isAdmin={true}
              />
            )}
          </CardContent>
        </Card>

        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <StationForm
                isOpen={isFormOpen}
                onClose={handleFormClose}
                onSuccess={handleFormClose}
                station={selectedStation}
                selectedRouteId=""
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default StationManagementPage;
