
import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, MapPin } from "lucide-react";
import { IStation, IBus } from "@/types";
import { getBusId } from "@/utils/typeGuards";

interface StationTableProps {
  stations: IStation[];
  buses: IBus[];
  isLoading: boolean;
  onAddStation: () => void;
  onEditStation: (station: IStation) => void;
  onDeleteStation: (id: string) => void;
  isAdmin: boolean;
}

const StationTable: React.FC<StationTableProps> = ({
  stations,
  buses,
  isLoading,
  onEditStation,
  onDeleteStation,
  isAdmin
}) => {
  const getBusName = (busId: string | IBus) => {
    const busIdString = getBusId(busId);
    const bus = buses.find(b => b._id === busIdString);
    return bus ? bus.name : "Unknown Bus";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <span className="ml-3 text-gray-400">Loading stations...</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-700">
            <TableHead className="text-gray-300">Station Name</TableHead>
            <TableHead className="text-gray-300">Assigned Bus</TableHead>
            <TableHead className="text-gray-300">Location</TableHead>
            <TableHead className="text-gray-300">Fare</TableHead>
            {isAdmin && <TableHead className="text-gray-300">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {stations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-8 text-gray-400">
                <MapPin className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                <p>No stations found</p>
              </TableCell>
            </TableRow>
          ) : (
            stations.map((station) => (
              <TableRow key={station._id} className="border-b border-gray-700 hover:bg-gray-800">
                <TableCell className="font-medium text-white">{station.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-blue-600/20 text-blue-400 border-blue-600">
                    {getBusName(station.busId)}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-300">
                  {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                </TableCell>
                <TableCell className="text-green-400 font-medium">₹{station.fare}</TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditStation(station)}
                        className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteStation(station._id)}
                        className="bg-red-700 border-red-600 text-white hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StationTable;
