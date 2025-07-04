
import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride' },
  createdAt: { type: Date, default: Date.now }
});

const WalletSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Clerk User ID
  balance: { type: Number, default: 0, min: 0 },
  transactions: [TransactionSchema]
}, { timestamps: true });

// Add funds to wallet
WalletSchema.methods.addFunds = function(amount, description = 'Wallet top-up') {
  this.balance += amount;
  this.transactions.push({
    type: 'credit',
    amount: amount,
    description: description
  });
  return this.save();
};

// Deduct funds from wallet
WalletSchema.methods.deductFunds = function(amount, description = 'Payment', rideId = null) {
  if (this.balance < amount) {
    throw new Error('Insufficient funds');
  }
  
  this.balance -= amount;
  this.transactions.push({
    type: 'debit',
    amount: amount,
    description: description,
    rideId: rideId
  });
  return this.save();
};

// Check if the model exists before creating a new one
const Wallet = mongoose.models.Wallet || mongoose.model("Wallet", WalletSchema);

export default Wallet;
