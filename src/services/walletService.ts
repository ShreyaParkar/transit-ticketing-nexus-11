
import { IWallet, ITransaction } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthenticatedAPI } from "./api/base";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const walletService = {
  getBalance: async (userId: string, authToken?: string): Promise<IWallet> => {
    try {
      console.log('Fetching wallet balance for user:', userId);
      const response = await fetch(`${API_URL}/wallet/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('Wallet not found, returning default wallet');
          return {
            _id: `wallet_${userId}`,
            userId,
            balance: 0,
            transactions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        
        if (response.status === 401) {
          console.warn('Wallet access unauthorized');
          throw new Error('Authentication required to access wallet');
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      const wallet = result.wallet || result;
      const processedWallet = {
        ...wallet,
        transactions: wallet.transactions || [],
        createdAt: wallet.createdAt || new Date().toISOString(),
        balance: typeof wallet.balance === 'number' ? wallet.balance : 0,
      };
      console.log('Fetched wallet data:', processedWallet);
      return processedWallet;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  },

  addFunds: async (userId: string, amount: number, authToken?: string): Promise<IWallet> => {
    try {
      const response = await fetch(`${API_URL}/wallet/${userId}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        body: JSON.stringify({ amount }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add funds');
      }
      
      const result = await response.json();
      const wallet = result.wallet || result;
      return {
        ...wallet,
        transactions: wallet.transactions || [],
        createdAt: wallet.createdAt || new Date().toISOString(),
        balance: typeof wallet.balance === 'number' ? wallet.balance : 0,
      };
    } catch (error) {
      console.error('Error adding funds:', error);
      throw error;
    }
  },

  deductFunds: async (userId: string, amount: number, description: string, authToken?: string): Promise<IWallet> => {
    try {
      const response = await fetch(`${API_URL}/wallet/${userId}/deduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        body: JSON.stringify({ amount, description }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to deduct funds');
      }
      
      const result = await response.json();
      const wallet = result.wallet || result;
      return {
        ...wallet,
        transactions: wallet.transactions || [],
        createdAt: wallet.createdAt || new Date().toISOString(),
        balance: typeof wallet.balance === 'number' ? wallet.balance : 0,
      };
    } catch (error) {
      console.error('Error deducting funds:', error);
      throw error;
    }
  },
};

export const useWallet = (userId: string) => {
  const queryClient = useQueryClient();
  const { makeAuthenticatedCall, isAuthenticated } = useAuthenticatedAPI();

  const { data: wallet, isLoading, error, refetch } = useQuery({
    queryKey: ['wallet', userId],
    queryFn: async () => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }
      return await makeAuthenticatedCall<IWallet>(`/wallet/${userId}`);
    },
    enabled: !!userId && isAuthenticated,
    staleTime: 1000, // Consider data fresh for 1 second only
    refetchInterval: 10000, // Refetch every 10 seconds for reactivity
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: (failureCount, error: any) => {
      if (error.message.includes('Authentication')) return false;
      return failureCount < 2;
    },
  });

  const addFundsMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }
      return await makeAuthenticatedCall<IWallet>(`/wallet/${userId}/add`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });
    },
    onMutate: async (amount) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['wallet', userId] });
      const previousWallet = queryClient.getQueryData(['wallet', userId]);
      
      if (previousWallet) {
        queryClient.setQueryData(['wallet', userId], (old: IWallet) => ({
          ...old,
          balance: old.balance + amount,
          transactions: [
            {
              type: 'credit',
              amount,
              description: 'Wallet top-up',
              createdAt: new Date().toISOString()
            },
            ...old.transactions
          ]
        }));
      }
      
      return { previousWallet };
    },
    onError: (err, amount, context) => {
      // Rollback on error
      if (context?.previousWallet) {
        queryClient.setQueryData(['wallet', userId], context.previousWallet);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', userId] });
      refetch();
    },
  });

  const deductFundsMutation = useMutation({
    mutationFn: async ({ amount, description }: { amount: number; description: string }) => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }
      return await makeAuthenticatedCall<IWallet>(`/wallet/${userId}/deduct`, {
        method: 'POST',
        body: JSON.stringify({ amount, description }),
      });
    },
    onMutate: async ({ amount, description }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['wallet', userId] });
      const previousWallet = queryClient.getQueryData(['wallet', userId]);
      
      if (previousWallet) {
        queryClient.setQueryData(['wallet', userId], (old: IWallet) => ({
          ...old,
          balance: Math.max(0, old.balance - amount),
          transactions: [
            {
              type: 'debit',
              amount,
              description,
              createdAt: new Date().toISOString()
            },
            ...old.transactions
          ]
        }));
      }
      
      return { previousWallet };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousWallet) {
        queryClient.setQueryData(['wallet', userId], context.previousWallet);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', userId] });
      refetch();
    },
  });

  // Function to force wallet refresh (useful after trip completion)
  const forceRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['wallet', userId] });
    await refetch();
  };

  return {
    wallet,
    isLoading,
    error,
    addFunds: addFundsMutation.mutate,
    deductFunds: deductFundsMutation.mutate,
    isAddingFunds: addFundsMutation.isPending,
    isDeductingFunds: deductFundsMutation.isPending,
    refetchWallet: refetch,
    forceRefresh,
  };
};

export const deductFunds = async (userId: string, amount: number, description: string, authToken?: string) => {
  return walletService.deductFunds(userId, amount, description, authToken);
};
