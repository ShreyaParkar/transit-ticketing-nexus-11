import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Bus } from "lucide-react";
import { toast } from "sonner";

const darkTheme = {
  variables: {
    colorPrimary: "#FF7E1D",
    colorBackground: "#FFFFFF",
    colorText: "#0F172A",
    colorSuccess: "#2ecc71",
    colorError: "#e74c3c",
    borderRadius: "0.5rem",
    fontFamily: "Inter, sans-serif",
  },
  elements: {
    formButtonPrimary: "bg-transit-orange hover:bg-transit-orange-dark",
    card: "shadow-xl rounded-xl border border-transit-orange-light",
    socialButtonsIconButton: "border-transit-orange-light hover:bg-transit-orange/5",
    footer: "hidden",
  }
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const [redirecting, setRedirecting] = useState(false);
  
  useEffect(() => {
    if (isSignedIn) {
      setRedirecting(true);
      toast.success("Welcome back! You're logged in.");
      setTimeout(() => navigate('/'), 1500);
    }
  }, [isSignedIn, navigate]);
  
  return (
    <div className="min-h-screen transitBg flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-gradient-to-r from-transit-orange to-transit-orange-dark p-3 rounded-xl mb-4 shadow-lg">
          <Bus size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-transit-orange-dark">BusInn</h1>
        <p className="text-muted-foreground mt-1">Your smart transit companion</p>
      </div>
      
      <div className="w-full max-w-md">
        {redirecting ? (
          <div className="bg-white p-8 rounded-xl shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-transit-orange"></div>
            <p className="mt-4 text-transit-orange-dark">Redirecting to the dashboard...</p>
          </div>
        ) : (
          <>
            <SignIn 
              appearance={darkTheme}
              signUpUrl="/signup"
              fallbackRedirectUrl="/"
            />
            <div className="mt-4 text-center">
              <p>
                Don't have an account?{" "}
                <Link to="/signup" className="text-transit-orange hover:text-transit-orange-dark font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
      
      <Button 
        variant="ghost" 
        className="mt-8 text-transit-orange hover:text-transit-orange-dark hover:bg-transparent"
        onClick={() => navigate('/')}
      >
        Back to Home
      </Button>
    </div>
  );
};

export const SignupPage = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  
  useEffect(() => {
    if (isSignedIn) {
      toast.success("Welcome to BusInn!");
      navigate('/');
    }
  }, [isSignedIn, navigate]);
  
  return (
    <div className="min-h-screen transitBg flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-gradient-to-r from-transit-orange to-transit-orange-dark p-3 rounded-xl mb-4 shadow-lg">
          <Bus size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-transit-orange-dark">BusInn</h1>
        <p className="text-muted-foreground mt-1">Your smart transit companion</p>
      </div>
      
      <div className="w-full max-w-md">
        <>
          <SignUp 
            appearance={darkTheme}
            signInUrl="/login"
            fallbackRedirectUrl="/"
          />
          <div className="mt-4 text-center">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="text-transit-orange hover:text-transit-orange-dark font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </>
      </div>
      
      <Button 
        variant="ghost" 
        className="mt-8 text-transit-orange hover:text-transit-orange-dark hover:bg-transparent"
        onClick={() => navigate('/')}
      >
        Back to Home
      </Button>
    </div>
  );
};
