
import express from 'express';
import mongoose from 'mongoose';
import Trip from '../models/Trip.js';
import Wallet from '../models/Wallet.js';
import User from '../models/User.js';

const router = express.Router();

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Calculate fare based on distance (₹5 base + ₹2 per km)
const calculateFare = (distance) => {
  const baseFare = 5;
  const perKmRate = 2;
  return Math.max(baseFare, baseFare + (distance * perKmRate));
};

// Start a new trip
router.post('/start', async (req, res) => {
  try {
    const { userId, latitude, longitude } = req.body;
    
    if (!userId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user already has an active trip
    const existingTrip = await Trip.findOne({ userId, active: true });
    if (existingTrip) {
      return res.status(400).json({ error: 'User already has an active trip' });
    }
    
    const newTrip = new Trip({
      userId,
      startLocation: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        timestamp: new Date()
      },
      active: true
    });
    
    await newTrip.save();
    
    res.status(201).json({
      success: true,
      trip: newTrip
    });
  } catch (error) {
    console.error('Error starting trip:', error);
    res.status(500).json({ error: 'Failed to start trip' });
  }
});

// End a trip
router.put('/:tripId/end', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ error: 'Invalid trip ID format' });
    }
    
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    if (!trip.active) {
      return res.status(400).json({ error: 'Trip is already completed' });
    }
    
    // Calculate distance and fare
    const distance = calculateDistance(
      trip.startLocation.latitude,
      trip.startLocation.longitude,
      parseFloat(latitude),
      parseFloat(longitude)
    );
    
    const fare = calculateFare(distance);
    
    // Update trip
    trip.endLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp: new Date()
    };
    trip.active = false;
    trip.distance = distance;
    trip.fare = fare;
    trip.duration = Math.round((new Date() - trip.startLocation.timestamp) / 1000 / 60); // minutes
    
    await trip.save();
    
    // Try to deduct fare from wallet
    let deductionResult = { status: 'failed', message: 'Payment processing failed' };
    
    try {
      let wallet = await Wallet.findOne({ userId: trip.userId });
      
      if (!wallet) {
        // Create wallet if it doesn't exist
        wallet = new Wallet({ userId: trip.userId, balance: 0, transactions: [] });
        await wallet.save();
      }
      
      if (wallet.balance >= fare) {
        await wallet.deductFunds(fare, `Trip fare - ${distance.toFixed(2)}km`, trip._id);
        deductionResult = { 
          status: 'success', 
          message: `₹${fare.toFixed(2)} deducted from wallet. New balance: ₹${(wallet.balance - fare).toFixed(2)}`
        };
      } else {
        deductionResult = { 
          status: 'insufficient_funds', 
          message: `Insufficient funds. Required: ₹${fare.toFixed(2)}, Available: ₹${wallet.balance.toFixed(2)}`
        };
      }
    } catch (walletError) {
      console.error('Wallet deduction error:', walletError);
      deductionResult = { 
        status: 'error', 
        message: `Payment error: ${walletError.message}` 
      };
    }
    
    res.json({
      success: true,
      trip,
      deduction: deductionResult
    });
  } catch (error) {
    console.error('Error ending trip:', error);
    res.status(500).json({ error: 'Failed to end trip' });
  }
});

// Get active trip for user
router.get('/active/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const activeTrip = await Trip.findOne({ userId, active: true });
    
    if (!activeTrip) {
      return res.status(404).json({ error: 'No active trip found' });
    }
    
    res.json({
      active: true,
      trip: activeTrip
    });
  } catch (error) {
    console.error('Error fetching active trip:', error);
    res.status(500).json({ error: 'Failed to fetch active trip' });
  }
});

// Get user trip history
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const trips = await Trip.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(trips);
  } catch (error) {
    console.error('Error fetching user trips:', error);
    res.status(500).json({ error: 'Failed to fetch user trips' });
  }
});

export default router;
