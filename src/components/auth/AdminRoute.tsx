
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "@/context/UserContext"; 
import { toast } from "sonner";

interface AdminRouteProps {
  redirectPath?: string;
  children?: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ 
  redirectPath = "/login", 
  children 
}) => {
  const { isAuthenticated, isAdmin } = useUser();
  
  if (!isAuthenticated) {
    toast.error("You must be logged in to access this page");
    return <Navigate to={redirectPath} replace />;
  }
  
  if (!isAdmin) {
    toast.error("You do not have permission to access this page");
    return <Navigate to="/" replace />;
  }
  
  return children ? <>{children}</> : <Outlet />;
};

export default AdminRoute;
