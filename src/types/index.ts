export interface IRoute {
  _id: string;
  start: string;
  end: string;
  fare: number;
}

export interface IBus {
  _id: string;
  name: string;
  route: string | IRoute | null;
  capacity: number;
}

export interface IStation {
  _id: string;
  routeId: string | IRoute;
  busId: string | IBus;
  name: string;
  latitude: number;
  longitude: number;
  fare: number;
  location?: string;
}

export interface ITicket {
  _id: string;
  userId: string;
  routeId: string | IRoute;
  busId: string | IBus;
  startStation: string;
  endStation: string;
  price: number;
  paymentIntentId: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPass {
  _id: string;
  userId: string;
  routeId: string | IRoute;
  startDate: string;
  endDate: string;
  expiryDate: string;
  purchaseDate: string;
  active: boolean;
  price: number;
  fare: number;
  usageCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IPassUsage {
  _id: string;
  userId: string;
  passId: string | IPass;
  scannedAt: string;
  location?: string;
}

export interface IPayment {
  _id: string;
  userId: string;
  type: 'pass' | 'ticket';
  routeId: string | IRoute | null;
  start: string | null;
  end: string | null;
  fare: number;
  stripeSessionId: string;
  status: 'pending' | 'completed';
}

export interface IUser {
  _id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface ILocation {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface ITrip {
  _id: string;
  userId: string;
  startLocation: ILocation;
  endLocation?: ILocation;
  active: boolean;
  distance?: number;
  fare?: number;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IRide {
  _id: string;
  userId: string;
  userName: string;
  busId: string;
  busName: string;
  startLocation: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  endLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  active: boolean;
  distance?: number;
  fare?: number;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IWallet {
  _id: string;
  userId: string;
  balance: number;
  transactions: ITransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface ITransaction {
  _id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  createdAt: string;
}

export interface IWalletTransaction {
  _id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  rideId?: string;
  createdAt: string;
}

// Type guard helpers
export const isRoute = (route: string | IRoute | null): route is IRoute => {
  return typeof route === 'object' && route !== null && '_id' in route;
};

export const isBus = (bus: string | IBus): bus is IBus => {
  return typeof bus === 'object' && bus !== null && '_id' in bus;
};

export const isPass = (pass: string | IPass): pass is IPass => {
  return typeof pass === 'object' && pass !== null && '_id' in pass;
};
