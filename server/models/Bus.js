
import mongoose from "mongoose";

const BusSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Bus name is required'], 
    unique: true, 
    trim: true 
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route",
    required: [true, 'Route is required'],
  },
  capacity: { 
    type: Number, 
    required: [true, 'Capacity is required'], 
    min: [1, 'Capacity must be at least 1'] 
  },
}, {
  timestamps: true
});

// Add indexes for better performance
BusSchema.index({ route: 1 });
BusSchema.index({ name: 1 });

// Ensure we don't try to recompile the model if it already exists
const Bus = mongoose.models.Bus || mongoose.model("Bus", BusSchema);

export default Bus;
