
import React from "react";
import { CheckCircle, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IPass } from "@/types";
import { getRouteDisplay } from "@/utils/typeGuards";

interface PassBenefitsCardProps {
  activePass: IPass;
  onRefresh: () => void;
}

export const PassBenefitsCard: React.FC<PassBenefitsCardProps> = ({
  activePass,
  onRefresh
}) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="mr-2 h-5 w-5 text-transit-green" />
          Pass Benefits
        </CardTitle>
        <CardDescription>
          Enjoy unlimited travel on your selected route
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          <li className="flex">
            <Check className="mr-2 h-4 w-4 text-transit-green mt-1" />
            <span>Unlimited rides on the {getRouteDisplay(activePass.routeId)} route</span>
          </li>
          <li className="flex">
            <Check className="mr-2 h-4 w-4 text-transit-green mt-1" />
            <span>Valid for a full month from date of purchase</span>
          </li>
          <li className="flex">
            <Check className="mr-2 h-4 w-4 text-transit-green mt-1" />
            <span>More economical than buying individual tickets</span>
          </li>
          <li className="flex">
            <Check className="mr-2 h-4 w-4 text-transit-green mt-1" />
            <span>No need to purchase tickets for every journey</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-2">
        <Button variant="outline" onClick={() => navigate("/")}>
          Explore Routes
        </Button>
        <Button 
          onClick={onRefresh}
          variant="ghost" 
          className="w-full sm:w-auto"
        >
          Refresh Pass Status
        </Button>
      </CardFooter>
    </Card>
  );
};
