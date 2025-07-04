
export interface LocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
}

export const getHighAccuracyLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    console.log("Requesting high-accuracy location for QR scanner...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        console.log("QR Scanner location obtained:", locationData, "Accuracy:", position.coords.accuracy, "meters");
        resolve(locationData);
      },
      (error) => {
        console.error("Error getting location for QR scanner:", error);
        reject(new Error(`Unable to get your current location: ${error.message}. Please enable location services.`));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  });
};
