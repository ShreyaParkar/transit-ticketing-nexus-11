
import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const RideSchema = new mongoose.Schema({
  userId: { type: String, required: true },  // Clerk User ID
  userName: { type: String, required: true }, // User display name
  busId: { type: String, required: true },   // Bus identifier
  busName: { type: String, required: true }, // Bus display name
  startLocation: { type: LocationSchema, required: true },
  endLocation: { type: LocationSchema },
  active: { type: Boolean, default: true },
  distance: { type: Number },  // in kilometers
  fare: { type: Number },      // calculated fare
  duration: { type: Number },  // in minutes
}, { timestamps: true });

// Calculate distance between two points using Haversine formula
RideSchema.methods.calculateDistance = function() {
  if (!this.startLocation || !this.endLocation) {
    return 0;
  }
  
  const toRadians = (degree) => degree * (Math.PI / 180);
  
  const lat1 = this.startLocation.latitude;
  const lon1 = this.startLocation.longitude;
  const lat2 = this.endLocation.latitude;
  const lon2 = this.endLocation.longitude;
  
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  return parseFloat(distance.toFixed(2));
};

// Calculate fare based on distance
RideSchema.methods.calculateFare = function() {
  const distance = this.calculateDistance();
  this.distance = distance;
  
  // Base fare + per km charge
  const baseFare = 20;
  const perKmCharge = 8;
  
  const fare = baseFare + (distance * perKmCharge);
  this.fare = Math.round(fare);
  
  return this.fare;
};

// Calculate trip duration
RideSchema.methods.calculateDuration = function() {
  if (!this.startLocation || !this.endLocation) {
    return 0;
  }
  
  const startTime = new Date(this.startLocation.timestamp);
  const endTime = new Date(this.endLocation.timestamp);
  
  const durationMs = endTime - startTime;
  const durationMinutes = Math.round(durationMs / 60000);
  
  this.duration = durationMinutes;
  return durationMinutes;
};

// Check if the model exists before creating a new one
const Ride = mongoose.models.Ride || mongoose.model("Ride", RideSchema);

export default Ride;
