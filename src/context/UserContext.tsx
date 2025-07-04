
import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser as useClerkUser, useClerk } from "@clerk/clerk-react";

type UserRole = "user" | "admin";

type UserContextType = {
  isAuthenticated: boolean;
  userId: string | null;
  userDetails: any;
  isAdmin: boolean;
  userRole: UserRole;
  logout: () => void;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType>({
  isAuthenticated: false,
  userId: null,
  userDetails: null,
  isAdmin: false,
  userRole: "user",
  logout: () => {},
  isLoading: true,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useClerkUser();
  const { signOut } = useClerk();
  const [userId, setUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole>("user");

  useEffect(() => {
    if (!isLoaded) return; // Wait for Clerk to load
    
    if (isSignedIn && user) {
      setUserId(user.id);
      
      // Get role from user metadata (secure way)
      const role = (user.publicMetadata?.role as UserRole) || "user";
      setUserRole(role);
      
      setUserDetails({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.primaryEmailAddress?.emailAddress,
        imageUrl: user.imageUrl,
        role: role
      });
      
      // Store only user ID for API calls (not sensitive data)
      localStorage.setItem("userId", user.id);
    } else {
      setUserId(null);
      setUserDetails(null);
      setUserRole("user");
      localStorage.removeItem("userId");
    }
  }, [isLoaded, isSignedIn, user]);

  const logout = async () => {
    try {
      await signOut();
      setUserId(null);
      setUserDetails(null);
      localStorage.removeItem("userId");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      isAuthenticated: !!userId, 
      userId, 
      userDetails,
      isAdmin: userRole === "admin",
      userRole,
      logout,
      isLoading: !isLoaded
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
