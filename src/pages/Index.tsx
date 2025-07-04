
import React from "react";
import { useUser } from "@/context/UserContext";
import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import FeatureCards from "@/components/home/FeatureCards";
import HowItWorks from "@/components/home/HowItWorks";

const Index = () => {
  const { isAuthenticated, userDetails } = useUser();

  return (
    <MainLayout title="Home">
      <div className="relative w-full max-w-5xl mx-auto my-8 px-2 sm:px-4">
        {/* Decorative BG */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/30 rounded-full blur-3xl z-0 animate-fade-in" />
        <div className="absolute top-1/2 -left-24 w-64 h-32 bg-secondary/50 rounded-full blur-3xl z-0 animate-fade-in" />

        <HeroSection isAuthenticated={isAuthenticated} userDetails={userDetails} />
        
        <FeatureCards />
        
        <HowItWorks />
      </div>
    </MainLayout>
  );
};

export default Index;
