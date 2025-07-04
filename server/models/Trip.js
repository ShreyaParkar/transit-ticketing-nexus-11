
import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const tripSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  startLocation: { type: locationSchema, required: true },
  endLocation: { type: locationSchema },
  active: { type: Boolean, default: true },
  distance: { type: Number },
  fare: { type: Number },
  duration: { type: Number }, // in minutes
}, { timestamps: true });

// Calculate distance using Haversine formula
tripSchema.methods.calculateDistance = function() {
  if (!this.endLocation) return;
  
  const R = 6371; // Earth's radius in km
  const dLat = (this.endLocation.latitude - this.startLocation.latitude) * Math.PI / 180;
  const dLng = (this.endLocation.longitude - this.startLocation.longitude) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.startLocation.latitude * Math.PI / 180) * 
    Math.cos(this.endLocation.latitude * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  this.distance = Math.round(R * c * 100) / 100; // Round to 2 decimal places
};

// Calculate fare based on distance (₹10 base + ₹5 per km)
tripSchema.methods.calculateFare = function() {
  if (!this.distance) return;
  this.fare = Math.max(10, Math.round(10 + (this.distance * 5)));
};

// Calculate duration in minutes
tripSchema.methods.calculateDuration = function() {
  if (!this.endLocation) return;
  const start = new Date(this.startLocation.timestamp);
  const end = new Date(this.endLocation.timestamp);
  this.duration = Math.round((end - start) / (1000 * 60)); // Convert to minutes
};

export default mongoose.models.Trip || mongoose.model('Trip', tripSchema);
