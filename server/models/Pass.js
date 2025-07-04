
import mongoose from "mongoose";

const PassSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Clerk User ID
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },
  fare: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true }, // Expires in 1 month
  qrCodeData: { type: String }, // Generated QR code data
  active: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 }, // Track how many times the pass has been used
}, { timestamps: true });

// Generate QR code data before saving
PassSchema.pre('save', function(next) {
  if (this.isNew) {
    this.qrCodeData = JSON.stringify({
      type: "pass",
      passId: this._id,
      userId: this.userId,
      expiryDate: this.expiryDate,
      routeId: this.routeId,
    });
  }
  next();
});

// Method to check if pass is valid
PassSchema.methods.isValid = function() {
  return this.active && new Date() < this.expiryDate;
};

// Method to record usage
PassSchema.methods.recordUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Check if the model exists before creating a new one
const Pass = mongoose.models.Pass || mongoose.model("Pass", PassSchema);

export default Pass;
