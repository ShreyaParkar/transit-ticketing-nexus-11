
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import MainLayout from "@/components/layout/MainLayout";
import { PassCurrentView } from "@/components/passes/PassCurrentView";
import { PassPurchaseForm } from "@/components/passes/PassPurchaseForm";
import { usePassManagement } from "@/hooks/usePassManagement";

const PassPage = () => {
  const {
    routes,
    activePass,
    usageHistory,
    selectedRouteId,
    setSelectedRouteId,
    selectedRoute,
    activeTab,
    setActiveTab,
    isProcessing,
    isLoadingRoutes,
    isLoadingPass,
    isLoadingUsage,
    handlePurchasePass,
    refetchPass
  } = usePassManagement();

  return (
    <MainLayout title="Monthly Pass">
      <div className="max-w-4xl mx-auto">
        {isLoadingPass ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        ) : activePass ? (
          <PassCurrentView
            activePass={activePass}
            usageHistory={usageHistory}
            isLoadingUsage={isLoadingUsage}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onRefresh={refetchPass}
          />
        ) : (
          <div className="animate-fade-in">
            <PassPurchaseForm
              routes={routes}
              selectedRouteId={selectedRouteId}
              setSelectedRouteId={setSelectedRouteId}
              selectedRoute={selectedRoute}
              isLoadingRoutes={isLoadingRoutes}
              isProcessing={isProcessing}
              onPurchase={handlePurchasePass}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PassPage;
