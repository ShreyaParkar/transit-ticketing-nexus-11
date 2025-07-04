
import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Menu, X, User, Ticket, Map, Calendar, Bus, MapPin, Navigation, Settings, QrCode, Wallet, Route, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { UserButton } from "@clerk/clerk-react";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, isAdmin, userDetails } = useUser();

  const publicNavItems = [
    { name: "Home", icon: <Map size={20} />, path: "/" },
    { name: "My Tickets", icon: <Ticket size={20} />, path: "/tickets" },
    { name: "Monthly Pass", icon: <Calendar size={20} />, path: "/pass" },
    { name: "Live Tracking", icon: <Navigation size={20} />, path: "/tracking" },
    { name: "QR", icon: <QrCode size={20} />, path: "/qr-scan/:userId" },
    { name: "wallet", icon: <Wallet size={20} />, path: "/wallet" },
  ];

  const adminNavItems = [
    { name: "Admin Dashboard", icon: <Settings size={20} />, path: "/admin" },
    { name: "Routes", icon: <Route size={20} />, path: "/routes" },
    { name: "Buses", icon: <Bus size={20} />, path: "/buses" },
    { name: "Stations", icon: <MapPin size={20} />, path: "/stations" },
    { name: "Scanner", icon: <ScanLine size={20} />, path: "/qr-scanner" },
    { name: "Admin Live Tracking", icon: <Navigation size={20} />, path: "/admin/live-tracking" },
  ];

  const navItems = [...publicNavItems, ...(isAdmin ? adminNavItems : [])];

  const currentNavItem = navItems.find(item => {
    if (item.path.includes(":")) {
        const basePath = item.path.split("/:")[0];
        return location.pathname.startsWith(basePath);
    }
    return location.pathname === item.path;
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full transitBg">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="h-12 sm:h-14 lg:h-16 bg-white shadow-md flex items-center justify-between px-2 sm:px-4 lg:px-6 sticky top-0 z-10">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
              <SidebarTrigger className="lg:hidden flex-shrink-0 h-6 w-6 sm:h-7 sm:w-7" />
              {currentNavItem && React.cloneElement(currentNavItem.icon as React.ReactElement, { className: "text-transit-orange-dark h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 flex-shrink-0", size: undefined })}
              <h1 className="text-xs sm:text-sm lg:text-xl font-semibold text-transit-orange-dark truncate">
                {title || "TransitNexus"}
              </h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-shrink-0">
              {isAdmin && (
                <span className="bg-amber-100 text-amber-800 px-1 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium">
                  <span className="hidden sm:inline">Admin</span>
                  <span className="sm:hidden">A</span>
                </span>
              )}
              {isAuthenticated && (
                <div className="flex items-center h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 border border-primary shadow"
                      }
                    }}
                    userProfileMode="modal"
                  />
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 p-1 sm:p-2 md:p-4 lg:p-6 min-w-0">{children}</main>
          <footer className="bg-white p-2 sm:p-3 lg:p-4 text-center text-xs sm:text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} BusInn. All rights reserved.
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
