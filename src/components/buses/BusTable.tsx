
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Bus as BusIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import BusTableRow from "./BusTableRow";
import { IBus, IStation, IRoute, isRoute } from "@/types";

interface BusTableProps {
  buses: IBus[] | undefined;
  isLoading: boolean;
  selectedRouteId: string;
  isAdmin: boolean;
  onAddBus: () => void;
  onEditBus: (bus: IBus) => void;
  onDeleteBus: (id: string) => void;
  onGenerateQR: (bus: IBus) => void;
  stations?: IStation[];
  isLoadingStations?: boolean;
  routes?: IRoute[];
}

const BusTable: React.FC<BusTableProps> = ({
  buses,
  isLoading,
  selectedRouteId,
  isAdmin,
  onAddBus,
  onEditBus,
  onDeleteBus,
  onGenerateQR,
  stations,
  isLoadingStations,
  routes
}) => {
  return (
    <div className="w-full flex flex-col">
      <Card className="h-fit border-orange-500/20 bg-gray-900">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between pb-2 border-b border-gray-700 gap-2">
          <div>
            <CardTitle className="text-xl font-bold text-yellow-300">Buses</CardTitle>
            <CardDescription className="text-gray-400">
              {selectedRouteId ? 
                "Buses for the selected route" : 
                "All buses in the system"
              }
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full bg-gray-800" />
                ))}
            </div>
          ) : !buses || buses.length === 0 ? (
            <div className="text-center p-8 border rounded-lg border-dashed border-gray-600 bg-gray-800/20">
              <BusIcon className="mx-auto h-12 w-12 mb-2 text-gray-500" />
              <p className="text-gray-400">
                {isLoading
                  ? "Loading buses..."
                  : "No buses found"}
              </p>
              {isAdmin && (
                <Button 
                  variant="outline" 
                  className="mt-4 border-orange-500/40 hover:border-orange-500 hover:bg-orange-900/10 text-orange-400" 
                  onClick={onAddBus}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add First Bus
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border border-gray-700 overflow-x-auto bg-gray-900">
              <Table>
                <TableHeader className="bg-gray-800">
                  <TableRow className="border-b border-gray-700">
                    <TableHead className="text-yellow-300 font-semibold bg-gray-800">Name</TableHead>
                    <TableHead className="text-yellow-300 font-semibold bg-gray-800">Route</TableHead>
                    <TableHead className="text-yellow-300 font-semibold bg-gray-800">Capacity</TableHead>
                    <TableHead className="text-yellow-300 font-semibold bg-gray-800 w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buses?.map(bus => {
                    // Get related route
                    let route: IRoute | undefined;
                    if (isRoute(bus.route)) {
                      route = bus.route;
                    } else if (routes && typeof bus.route === 'string') {
                      // Fallback for non-populated route
                      route = routes.find(r => r._id === bus.route);
                    }
                    // Get first related station
                    const station = stations?.find(stn => {
                      return (String(stn.busId) === String(bus._id));
                    });
                    return (
                      <BusTableRow
                        key={bus._id}
                        bus={bus}
                        isAdmin={isAdmin}
                        onEdit={onEditBus}
                        onDelete={onDeleteBus}
                        onGenerateQR={onGenerateQR}
                        route={route}
                        stationName={station?.name}
                      />
                    );
                  })}
                </TableBody>
              </Table>
              {isLoadingStations && (
                <div className="text-center p-2 text-sm text-gray-400">
                  Loading stations...
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BusTable;
