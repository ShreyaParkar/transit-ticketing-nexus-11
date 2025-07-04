
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/context/UserContext";
import { ClerkProvider } from "@clerk/clerk-react";
import Index from "./pages/Index";
import TicketsPage from "./pages/TicketsPage";
import PassPage from "./pages/PassPage";
import RoutesPage from "./pages/RoutesPage";
import BusesPage from "./pages/BusesPage";
import NotFound from "./pages/NotFound";
import StationManagementPage from "./pages/StationManagementPage";
import LiveTrackingPage from "./pages/LiveTrackingPage";
import AdminLiveTrackingPage from "./pages/AdminLiveTrackingPage";
import { LoginPage, SignupPage } from "./pages/AuthPages";
import AdminRoute from "@/components/auth/AdminRoute";
import WalletPage from "./pages/WalletPage";
import QRScannerPage from "./pages/QRScannerPage";

const queryClient = new QueryClient();
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading TransitNexus...</p>
    </div>
  </div>
);

import { useUser } from "@/context/UserContext";

const AppContent = () => {
  const { isLoading } = useUser();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/tickets" element={<TicketsPage />} />
      <Route path="/pass" element={<PassPage />} />
      <Route path="/tracking" element={<LiveTrackingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/wallet" element={<WalletPage />} />
      <Route path="/qr-scanner" element={<QRScannerPage />} />

      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin/live-tracking" element={<AdminLiveTrackingPage />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/buses" element={<BusesPage />} />
        <Route path="/stations" element={<StationManagementPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ClerkProvider 
    publishableKey={PUBLISHABLE_KEY}
    appearance={{
      baseTheme: undefined,
      variables: {
        colorPrimary: "#FF7E1D"
      }
    }}
  >
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
