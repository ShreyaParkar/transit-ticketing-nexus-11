
export interface BusLocation {
  latitude: number;
  longitude: number;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  updatedAt: string;
}

export interface BusLocations {
  [busId: string]: BusLocation;
}
