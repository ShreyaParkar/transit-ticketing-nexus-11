
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, TicketX } from "lucide-react";
import { ticketsAPI } from "@/services/api";
import { ITicket } from "@/types";
import { useUser } from "@/context/UserContext";
import MainLayout from "@/components/layout/MainLayout";
import { TicketCard } from "@/components/tickets/TicketCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewTicketModal } from "@/components/tickets/NewTicketModal";

const TicketsPage = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const [activeTab, setActiveTab] = useState("active");
  const [open, setOpen] = useState(false);

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets", userId],
    queryFn: () => ticketsAPI.getByUserId(userId || ""),
    enabled: !!userId,
  });

  const activeTickets = tickets.filter(
    (ticket) => new Date(ticket.expiryDate) > new Date()
  );

  const expiredTickets = tickets.filter(
    (ticket) => new Date(ticket.expiryDate) <= new Date()
  );

  const handleNewTicket = () => {
    setOpen(true);
  };

  return (
    <MainLayout title="My Tickets">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-end items-center mb-6">
          <Button onClick={handleNewTicket}>
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        </div>
        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active">
              Active Tickets ({activeTickets.length})
            </TabsTrigger>
            <TabsTrigger value="expired">
              Expired Tickets ({expiredTickets.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-pulse">Loading tickets...</div>
              </div>
            ) : activeTickets.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-white">
                <TicketX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No active tickets</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any active tickets at the moment
                </p>
                <Button onClick={handleNewTicket}>Book a Ticket</Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {activeTickets.map((ticket: ITicket) => (
                  <TicketCard key={ticket._id} ticket={ticket} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="expired">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-pulse">Loading tickets...</div>
              </div>
            ) : expiredTickets.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-white">
                <TicketX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No expired tickets</h3>
                <p className="text-muted-foreground">
                  You don't have any expired tickets
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {expiredTickets.map((ticket: ITicket) => (
                  <TicketCard key={ticket._id} ticket={ticket} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <NewTicketModal open={open} onOpenChange={setOpen} />
    </MainLayout>
  );
};

export default TicketsPage;
