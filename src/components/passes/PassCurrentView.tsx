
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PassCard } from "./PassCard";
import { PassBenefitsCard } from "./PassBenefitsCard";
import PassQRCode from "./PassQRCode";
import { IPass, IPassUsage } from "@/types";

interface PassCurrentViewProps {
  activePass: IPass;
  usageHistory: IPassUsage[];
  isLoadingUsage: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
}

export const PassCurrentView: React.FC<PassCurrentViewProps> = ({
  activePass,
  usageHistory,
  isLoadingUsage,
  activeTab,
  setActiveTab,
  onRefresh
}) => {
  return (
    <div className="animate-fade-in">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="current" className="flex-1">Current Pass</TabsTrigger>
          <TabsTrigger value="qr" className="flex-1">QR Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="space-y-6">
          <PassCard pass={activePass} className="mb-8" />
          <PassBenefitsCard activePass={activePass} onRefresh={onRefresh} />
        </TabsContent>
        
        <TabsContent value="qr">
          <PassQRCode activePass={activePass} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
