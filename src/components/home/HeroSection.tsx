
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bus as BusIcon } from "lucide-react";

const heroImg = "https://img.freepik.com/photos-premium/bus-neon-lumineux-roule-long-ville-streetgenerative-ai_391052-11683.jpg";

interface HeroSectionProps {
  isAuthenticated: boolean;
  userDetails: { firstName?: string | null } | null;
}

const HeroSection: React.FC<HeroSectionProps> = ({ isAuthenticated, userDetails }) => {
  const navigate = useNavigate();

  return (
    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 py-8 mb-12">
      {/* Hero Text */}
      <div className="flex-1 text-center md:text-left space-y-4 animate-fade-in">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 gradient-heading">
          {isAuthenticated && userDetails?.firstName
            ? `Welcome, ${userDetails.firstName}!`
            : "TransitNexus – Smart City Transit"}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Experience simple, modern travel. Book tickets, renew your pass, track buses—everything at your fingertips.
        </p>
        <div className="mt-5 flex gap-4 justify-center md:justify-start">
          <Button size="lg" className="animate-scale-in"
            onClick={() => navigate("/pass")}>
            Get a Pass
          </Button>
          <Button size="lg" variant="outline"
            onClick={() => navigate("/tickets")}>
            My Tickets
          </Button>
        </div>
      </div>
      {/* Hero Image */}
      <div className="flex-1 flex items-center justify-center animate-fade-in">
        <div className="shadow-2xl rounded-xl overflow-hidden w-[320px] h-[220px] relative group hover:scale-105 transition-transform duration-200">
          <img
            src={heroImg}
            alt="Modern neon bus in city street"
            className="object-cover w-full h-full"
            loading="lazy"
          />
          <div className="absolute top-3 right-3 bg-white/85 px-3 py-1 rounded-full flex items-center gap-2 shadow animate-fade-in">
            <BusIcon size={20} className="text-primary" />
            <span className="font-bold text-sm text-primary">
              Live Transit
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
