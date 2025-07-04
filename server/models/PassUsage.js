
import mongoose from "mongoose";

const PassUsageSchema = new mongoose.Schema({
  userId: { type: String, required: true },  // Clerk User ID
  passId: { type: mongoose.Schema.Types.ObjectId, ref: "Pass", required: true },
  scannedAt: { type: Date, default: Date.now },
  location: { type: String }, // Optional: Store bus stop/location
});

// Check if the model exists before creating a new one
const PassUsage = mongoose.models.PassUsage || mongoose.model("PassUsage", PassUsageSchema);

export default PassUsage;
