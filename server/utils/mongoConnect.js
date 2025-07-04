
import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

// Fix Mongoose deprecation warning
mongoose.set('strictQuery', false);

export const connect = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log("✅ MongoDB already connected");
    return;
  }

  try {
    const MONGODB_URI = process.env.VITE_MONGODB_URI || process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('MongoDB URI not found in environment variables');
    }

    await mongoose.connect(MONGODB_URI, {
      dbName: "transit-app",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("🚀 MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    
    // Register all models after connection
    await registerModels();
    
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    console.error("🔍 Check your MONGODB_URI in .env file");
    throw new Error("MongoDB connection failed");
  }
};

// Register all models to ensure they're available
const registerModels = async () => {
  try {
    // Import and register all models
    const { default: Route } = await import('../models/Route.js');
    const { default: Bus } = await import('../models/Bus.js');
    const { default: Station } = await import('../models/Station.js');
    const { default: Trip } = await import('../models/Trip.js');
    const { default: Ride } = await import('../models/Ride.js');
    const { default: User } = await import('../models/User.js');
    const { default: Wallet } = await import('../models/Wallet.js');
    const { default: Ticket } = await import('../models/Ticket.js');
    const { default: Pass } = await import('../models/Pass.js');
    const { default: PassUsage } = await import('../models/PassUsage.js');
    const { default: Payment } = await import('../models/Payment.js');
    
    console.log("📋 All models registered successfully");
    
    // Wait for models to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    console.error("❌ Error registering models:", error);
    throw error;
  }
};

export const disconnect = async () => {
  try {
    await mongoose.disconnect();
    console.log("📌 MongoDB disconnected");
  } catch (error) {
    console.error("❌ MongoDB disconnect error:", error);
  }
};
