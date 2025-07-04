
import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: "Bus", required: true },
    startStation: { type: String, required: true },
    endStation: { type: String, required: true },
    price: { type: Number, required: true },
    paymentIntentId: { type: String, required: true },
    expiryDate: { 
      type: Date, 
      required: true,
      default: function() {
        // Set expiry to 12 hours from creation
        return new Date(Date.now() + 12 * 60 * 60 * 1000);
      }
    },
  },
  { timestamps: true }
);

// Check if the model exists before creating a new one
const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
export default Ticket;
