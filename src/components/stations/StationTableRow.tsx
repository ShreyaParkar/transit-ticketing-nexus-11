
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, MapPin, DollarSign } from "lucide-react";
import { IStation, IBus } from "@/types";

interface StationTableRowProps {
  station: IStation;
  bus?: IBus;
  onEdit: (station: IStation) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const StationTableRow: React.FC<StationTableRowProps> = ({
  station,
  bus,
  onEdit,
  onDelete,
  isAdmin
}) => {
  return (
    <TableRow className="hover:bg-gray-800/50 border-b border-gray-700">
      <TableCell className="font-medium text-yellow-300 bg-gray-900">{station.name}</TableCell>
      <TableCell className="bg-gray-800">
        <span className="text-blue-300">{bus?.name || "Unknown Bus"}</span>
      </TableCell>
      <TableCell className="bg-gray-900">
        <div className="flex items-center text-green-300">
          <MapPin className="h-3 w-3 mr-1 text-green-500" />
          <span className="text-xs">
            {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
          </span>
        </div>
      </TableCell>
      <TableCell className="bg-gray-800">
        <Badge variant="outline" className="bg-yellow-900/30 text-yellow-300 border-yellow-500/30">
          <DollarSign className="h-3 w-3 mr-1" />
          ₹{station.fare}
        </Badge>
      </TableCell>
      <TableCell className="bg-gray-900">
        {isAdmin && (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-900/20" onClick={() => onEdit(station)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:bg-red-900/20" onClick={() => onDelete(station._id)}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};

export default StationTableRow;
