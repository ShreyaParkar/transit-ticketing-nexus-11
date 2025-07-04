
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard, IndianRupee, History, Loader2, RefreshCw } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useWallet } from "@/services/walletService";
import { paymentAPI } from "@/services/api/payments";
import { toast } from "sonner";

const WalletCard: React.FC = () => {
  const { userId, isAuthenticated } = useUser();
  const [addAmount, setAddAmount] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const { wallet, isLoading, refetchWallet, forceRefresh } = useWallet(userId || "");

  const handleAddFunds = async () => {
    const amount = parseFloat(addAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please log in to add funds");
      return;
    }

    try {
      setIsAdding(true);
      
      // Create Stripe checkout session for wallet top-up
      const { url } = await paymentAPI.createWalletCheckoutSession(amount);
      
      if (url) {
        // Store the amount for potential success handling
        sessionStorage.setItem('pendingWalletAmount', amount.toString());
        // Redirect to Stripe checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error("Error creating wallet checkout:", error);
      toast.error("Failed to start payment process. Please try again.");
      setIsAdding(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await forceRefresh();
      toast.success("Wallet balance refreshed");
    } catch (error) {
      console.error("Error refreshing wallet:", error);
      toast.error("Failed to refresh wallet balance");
    }
  };

  // Handle successful payment return
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const sessionId = urlParams.get('session_id');
    
    if (status === 'success' && sessionId) {
      const handlePaymentSuccess = async () => {
        try {
          await paymentAPI.verifyPayment(sessionId);
          const pendingAmount = sessionStorage.getItem('pendingWalletAmount');
          
          toast.success(`Wallet top-up successful!${pendingAmount ? ` ₹${pendingAmount} added.` : ''}`);
          sessionStorage.removeItem('pendingWalletAmount');
          
          // Force immediate wallet refresh
          setTimeout(() => {
            forceRefresh();
          }, 1000);
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error verifying payment:', error);
          toast.error('Payment verification failed. Please contact support.');
        }
      };
      
      handlePaymentSuccess();
    } else if (status === 'cancel') {
      toast.error('Payment was cancelled.');
      sessionStorage.removeItem('pendingWalletAmount');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [forceRefresh]);

  if (!isAuthenticated) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2 text-white">Please Login</h3>
            <p className="text-gray-400">You need to be logged in to use the wallet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin h-6 w-6 text-blue-400" />
            <span className="ml-2 text-gray-400">Loading wallet...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600/20 to-transparent border-b border-gray-700">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-blue-400" />
            Digital Wallet
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Balance Display */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center text-3xl font-bold text-green-400 mb-2">
            <IndianRupee className="h-6 w-6 mr-1" />
            {wallet?.balance?.toFixed(2) || "0.00"}
          </div>
          <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-600">
            Available Balance
          </Badge>
        </div>

        {/* Add Funds Section */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter amount"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              step="0.01"
              min="1"
              disabled={isAdding}
            />
            <Button
              onClick={handleAddFunds}
              disabled={isAdding || !addAmount}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isAdding ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Quick Add Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[100, 200, 500].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setAddAmount(amount.toString())}
                disabled={isAdding}
                className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                ₹{amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        {wallet?.transactions && wallet.transactions.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex items-center text-sm text-gray-400 mb-3">
              <History className="h-4 w-4 mr-2" />
              Recent Transactions
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {wallet.transactions.slice(-3).reverse().map((transaction, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-300 truncate">
                    {transaction.description}
                  </span>
                  <span className={`font-medium ${
                    transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletCard;
