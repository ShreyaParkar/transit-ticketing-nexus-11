
import React from 'react';
import { toast } from 'sonner';
import { CheckCircle, AlertTriangle, Info, XCircle, Loader2 } from 'lucide-react';

export interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const NotificationSystem = {
  success: (message: string, options?: NotificationOptions) => {
    toast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  },

  error: (message: string, options?: NotificationOptions) => {
    toast.error(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      icon: <XCircle className="h-4 w-4 text-red-600" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  },

  warning: (message: string, options?: NotificationOptions) => {
    toast.warning(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  },

  info: (message: string, options?: NotificationOptions) => {
    toast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <Info className="h-4 w-4 text-blue-600" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  },

  loading: (message: string, options?: NotificationOptions) => {
    return toast.loading(message, {
      description: options?.description,
      icon: <Loader2 className="h-4 w-4 animate-spin text-blue-600" />,
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success: (data) => typeof success === 'function' ? success(data) : success,
      error: (err) => typeof error === 'function' ? error(err) : error,
    });
  },

  // Admin-specific notifications
  admin: {
    busDeleted: (busName: string) => {
      NotificationSystem.success('Bus Deleted Successfully', {
        description: `${busName} has been removed from the system`,
        duration: 5000,
      });
    },

    stationUpdated: (stationName: string) => {
      NotificationSystem.success('Station Updated', {
        description: `${stationName} information has been updated`,
        duration: 4000,
      });
    },

    operationFailed: (operation: string, reason?: string) => {
      NotificationSystem.error(`${operation} Failed`, {
        description: reason || 'An unexpected error occurred',
        duration: 6000,
      });
    },
  },

  // User-specific notifications
  user: {
    ticketPurchased: (amount: number) => {
      NotificationSystem.success('Ticket Purchased!', {
        description: `₹${amount} deducted from your wallet`,
        duration: 5000,
      });
    },

    walletTopUp: (amount: number) => {
      NotificationSystem.success('Wallet Top-up Successful!', {
        description: `₹${amount} added to your wallet`,
        duration: 4000,
      });
    },

    insufficientFunds: (required: number, available: number) => {
      NotificationSystem.warning('Insufficient Funds', {
        description: `You need ₹${required} but only have ₹${available.toFixed(2)}`,
        duration: 5000,
        action: {
          label: 'Add Funds',
          onClick: () => {
            // Navigate to wallet page
            window.location.href = '/wallet';
          },
        },
      });
    },

    tripStarted: () => {
      NotificationSystem.info('Trip Started', {
        description: 'Have a safe journey!',
        duration: 3000,
      });
    },

    tripCompleted: (fare: number) => {
      NotificationSystem.success('Trip Completed', {
        description: `₹${fare} deducted from your wallet`,
        duration: 4000,
      });
    },
  },
};

export default NotificationSystem;
