
import express from 'express';
import Ride from '../models/Ride.js';
import User from '../models/User.js';

const router = express.Router();

// Start a new ride
router.post('/start', async (req, res) => {
  try {
    const { userId, latitude, longitude, busId, busName } = req.body;
    
    if (!userId || !latitude || !longitude || !busId || !busName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user already has an active ride
    const activeRide = await Ride.findOne({ userId, active: true });
    if (activeRide) {
      return res.status(400).json({ error: 'User already has an active ride' });
    }
    
    // Get user details
    const user = await User.findOne({ clerkId: userId });
    const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
    
    // Create new ride
    const newRide = new Ride({
      userId,
      userName,
      busId,
      busName,
      startLocation: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        timestamp: new Date()
      },
      active: true
    });
    
    await newRide.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Ride started successfully',
      ride: newRide 
    });
  } catch (error) {
    console.error('Error starting ride:', error);
    res.status(500).json({ error: 'Failed to start ride' });
  }
});

// End a ride
router.put('/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Find the active ride
    const ride = await Ride.findById(id);
    
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    
    if (!ride.active) {
      return res.status(400).json({ error: 'Ride is already completed' });
    }
    
    // Update ride with end location
    ride.endLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp: new Date()
    };
    ride.active = false;
    
    // Calculate ride metrics
    ride.calculateDistance();
    ride.calculateFare();
    ride.calculateDuration();
    
    await ride.save();
    
    res.json({ 
      success: true, 
      message: 'Ride ended successfully',
      ride: {
        id: ride._id,
        distance: ride.distance,
        fare: ride.fare,
        duration: ride.duration,
        startTime: ride.startLocation.timestamp,
        endTime: ride.endLocation.timestamp
      }
    });
  } catch (error) {
    console.error('Error ending ride:', error);
    res.status(500).json({ error: 'Failed to end ride' });
  }
});

// Get active ride for a user
router.get('/active/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const activeRide = await Ride.findOne({ userId, active: true });
    
    if (!activeRide) {
      return res.json({ active: false });
    }
    
    res.json({ 
      active: true,
      ride: activeRide
    });
  } catch (error) {
    console.error('Error getting active ride:', error);
    res.status(500).json({ error: 'Failed to get active ride' });
  }
});

// Get all active rides (for admin)
router.get('/active', async (req, res) => {
  try {
    const activeRides = await Ride.find({ active: true }).sort({ createdAt: -1 });
    res.json(activeRides);
  } catch (error) {
    console.error('Error getting active rides:', error);
    res.status(500).json({ error: 'Failed to get active rides' });
  }
});

// Get completed rides (for admin)
router.get('/completed', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const completedRides = await Ride.find({ active: false })
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Ride.countDocuments({ active: false });
    
    res.json({
      rides: completedRides,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error getting completed rides:', error);
    res.status(500).json({ error: 'Failed to get completed rides' });
  }
});

// Get ride history for a user
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const rides = await Ride.find({ 
      userId, 
      active: false 
    }).sort({ createdAt: -1 });
    
    res.json(rides);
  } catch (error) {
    console.error('Error getting ride history:', error);
    res.status(500).json({ error: 'Failed to get ride history' });
  }
});

export default router;
