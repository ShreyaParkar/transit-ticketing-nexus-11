
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { routesAPI, busesAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import RouteForm from "@/components/routes/RouteForm";
import { useUser } from "@/context/UserContext";
import { IRoute } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const RoutesPage = () => {
  const { isAdmin } = useUser();
  const queryClient = useQueryClient();
  const [isRouteFormOpen, setIsRouteFormOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<IRoute | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRouteId, setDeletingRouteId] = useState<string>("");

  // Fetch routes data
  const { data: routes, isLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: routesAPI.getAll
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: routesAPI.delete,
    onSuccess: () => {
      toast.success("Route deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleDeleteClick = (id: string) => {
    setDeletingRouteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(deletingRouteId);
    setDeleteDialogOpen(false);
  };

  const handleEdit = (route: IRoute) => {
    setSelectedRoute(route);
    setIsRouteFormOpen(true);
  };

  const handleRouteFormClose = () => {
    setIsRouteFormOpen(false);
    setSelectedRoute(null);
  };

  const handleFormSuccess = () => {
    setIsRouteFormOpen(false);
    setSelectedRoute(null);
    queryClient.invalidateQueries({ queryKey: ['routes'] });
    toast.success(`Route ${selectedRoute ? 'updated' : 'created'} successfully`);
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-1 sm:px-2 lg:px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 lg:mb-6 gap-2 sm:gap-3">
          <div className="w-full sm:w-auto">
            <p className="text-xs sm:text-sm text-muted-foreground">Manage your transit routes</p>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => setIsRouteFormOpen(true)} 
              className="bg-transit-orange hover:bg-transit-orange-dark text-white shadow-[0_0_10px_rgba(255,126,29,0.5)] w-full sm:w-auto text-xs sm:text-sm px-3 py-2"
            >
              <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Add Route
            </Button>
          )}
        </div>

        <Card className="bg-card border-transit-orange/20">
          <CardContent className="pt-3 sm:pt-4 px-1 sm:px-2 lg:px-4">
            {isLoading ? (
              <div className="space-y-2">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-10 sm:h-12 lg:h-16 w-full" />
                ))}
              </div>
            ) : routes?.length === 0 ? (
              <div className="text-center p-4 sm:p-6 lg:p-8 border rounded-lg border-dashed border-border">
                <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">No routes found</p>
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    className="mt-2 sm:mt-3 lg:mt-4 border-transit-orange/40 hover:border-transit-orange hover:bg-transit-orange/10 text-xs sm:text-sm px-3 py-2" 
                    onClick={() => setIsRouteFormOpen(true)}
                  >
                    <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Add First Route
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border border-border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm font-medium px-1 sm:px-2 lg:px-4">Route</TableHead>
                      <TableHead className="text-xs sm:text-sm font-medium px-1 sm:px-2 lg:px-4">Fare</TableHead>
                      {isAdmin && (
                        <TableHead className="text-right text-xs sm:text-sm font-medium px-1 sm:px-2 lg:px-4">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes?.map(route => (
                      <TableRow key={route._id} className="hover:bg-transit-orange/5">
                        <TableCell className="font-medium text-xs sm:text-sm px-1 sm:px-2 lg:px-4 py-1 sm:py-2 lg:py-4">
                          <div className="truncate max-w-[100px] sm:max-w-[150px] lg:max-w-none">
                            {route.start} - {route.end}
                          </div>
                        </TableCell>
                        <TableCell className="px-1 sm:px-2 lg:px-4 py-1 sm:py-2 lg:py-4">
                          <Badge 
                            variant="secondary" 
                            className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 text-xs px-1 sm:px-2"
                          >
                            ₹{route.fare}
                          </Badge>
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right px-1 sm:px-2 lg:px-4 py-1 sm:py-2 lg:py-4">
                            <div className="flex justify-end gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 p-0 text-transit-orange hover:bg-transit-orange/10" 
                                onClick={() => handleEdit(route)}
                              >
                                <Edit className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 p-0 text-destructive hover:bg-destructive/10" 
                                onClick={() => handleDeleteClick(route._id)}
                              >
                                <Trash className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {isRouteFormOpen && (
          <RouteForm
            isOpen={isRouteFormOpen}
            onClose={handleRouteFormClose}
            onSuccess={handleFormSuccess}
            route={selectedRoute}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-card border-destructive/30 mx-2 sm:mx-4 lg:mx-auto max-w-sm sm:max-w-md lg:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xs sm:text-sm lg:text-base">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-xs sm:text-sm">
                This will permanently delete the route. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <AlertDialogCancel className="text-xs sm:text-sm">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete}
                className="bg-destructive hover:bg-destructive/90 text-xs sm:text-sm"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default RoutesPage;
