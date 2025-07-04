
import mongoose from "mongoose";

const RouteSchema = new mongoose.Schema({
  start: { type: String, required: true },
  end: { type: String, required: true },
  fare: { type: Number, required: true }
});

// Check if the model exists before creating a new one
const Route = mongoose.models.Route || mongoose.model("Route", RouteSchema);

export default Route;
