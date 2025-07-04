
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { routesAPI, passesAPI, paymentAPI } from "@/services/api";
import { toast } from "sonner";

export const usePassManagement = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const sessionId = searchParams.get("session_id");
  const queryClient = useQueryClient();
  
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [activeTab, setActiveTab] = useState("current");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Handle payment success/cancel from URL params
  useEffect(() => {
    if (status === "success" && sessionId) {
      const handlePaymentSuccess = async () => {
        try {
          setIsProcessing(true);
          toast.success("Payment successful! Processing your pass...");
          
          const result = await paymentAPI.verifyPayment(sessionId);
          
          if (result.success) {
            toast.success("Monthly pass purchased successfully!");
            queryClient.invalidateQueries({ queryKey: ["activePass"] });
            queryClient.invalidateQueries({ queryKey: ["passes"] });
            
            // Clean up URL
            window.history.replaceState({}, document.title, '/pass');
          } else {
            toast.error("Failed to create pass after payment");
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          toast.error("Failed to process payment confirmation");
        } finally {
          setIsProcessing(false);
        }
      };
      
      handlePaymentSuccess();
    } else if (status === "cancel") {
      toast.error("Payment was canceled.");
      // Clean up URL
      window.history.replaceState({}, document.title, '/pass');
    }
  }, [status, sessionId, queryClient]);
  
  // Fetch routes
  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
    queryKey: ["routes"],
    queryFn: routesAPI.getAll,
    retry: 2,
    staleTime: 1000 * 60 * 2,
  });
  
  // Fetch active pass
  const {
    data: activePass,
    isLoading: isLoadingPass,
    error: passError,
    refetch: refetchPass
  } = useQuery({
    queryKey: ["activePass"],
    queryFn: passesAPI.getActivePass,
    retry: (failureCount, error) => {
      if (error.message.includes("404")) return false;
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 2,
  });

  // Fetch pass usage history
  const {
    data: usageHistory = [],
    isLoading: isLoadingUsage
  } = useQuery({
    queryKey: ["passUsage"],
    queryFn: passesAPI.getPassUsage,
    enabled: !!activePass,
    retry: 2,
    staleTime: 1000 * 60,
  });
  
  const selectedRoute = routes.find(r => r._id === selectedRouteId);

  // Handle purchase pass
  const handlePurchasePass = async () => {
    if (!selectedRouteId) {
      toast.error("Please select a route");
      return;
    }
    
    if (!selectedRoute) {
      toast.error("Invalid route selected");
      return;
    }
    
    try {
      setIsProcessing(true);
      toast.loading("Creating checkout session...");

      const response = await paymentAPI.createPassCheckoutSession(
        selectedRouteId,
        selectedRoute.fare * 20 // Monthly pass discount
      );
      
      if (response && response.url) {
        // Redirect to Stripe checkout
        window.location.href = response.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error: any) {
      console.error('Pass purchase error:', error);
      toast.error(error?.message || "Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
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
    passError,
    handlePurchasePass,
    refetchPass
  };
};
