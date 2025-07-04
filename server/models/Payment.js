
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, enum: ["pass", "ticket", "wallet"], required: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route", default: null },
  start: { type: String, default: null },
  end: { type: String, default: null },
  fare: { type: Number, required: true },
  stripeSessionId: { type: String, required: true, unique: true },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
}, { timestamps: true });

// Check if the model exists before creating a new one
const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

export default Payment;
