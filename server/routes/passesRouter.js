
import express from 'express';
import mongoose from 'mongoose';
import Pass from '../models/Pass.js';
import Route from '../models/Route.js';

const router = express.Router();

// Get passes by user ID
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Find active passes (not expired)
    const passes = await Pass.find({
      userId,
      expiryDate: { $gt: new Date() }
    }).populate('routeId');
    
    if (passes.length === 0) {
      return res.status(404).json({ error: 'No active passes found' });
    }
    
    // Return the most recent pass
    res.json(passes[0]);
  } catch (error) {
    console.error('Error fetching passes:', error);
    res.status(500).json({ error: 'Failed to fetch passes' });
  }
});

// Validate pass by QR code
router.post('/validate', async (req, res) => {
  try {
    const { qrData, location } = req.body;
    
    if (!qrData) {
      return res.status(400).json({ error: 'QR data is required' });
    }
    
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid QR code format' });
    }
    
    if (parsedData.type !== 'pass') {
      return res.status(400).json({ error: 'Invalid pass QR code' });
    }
    
    const pass = await Pass.findById(parsedData.passId).populate('routeId');
    
    if (!pass) {
      return res.status(404).json({ error: 'Pass not found' });
    }
    
    if (!pass.isValid()) {
      return res.status(400).json({ error: 'Pass is expired or inactive' });
    }
    
    // Record usage
    await pass.recordUsage();
    
    res.json({
      valid: true,
      pass: {
        _id: pass._id,
        userId: pass.userId,
        routeId: pass.routeId,
        fare: pass.fare,
        expiryDate: pass.expiryDate,
        usageCount: pass.usageCount
      },
      message: 'Pass validated successfully'
    });
  } catch (error) {
    console.error('Error validating pass:', error);
    res.status(500).json({ error: 'Failed to validate pass' });
  }
});

// Create pass
router.post('/', async (req, res) => {
  try {
    const { userId, routeId, fare } = req.body;
    
    if (!userId || !routeId || !fare) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate routeId
    if (!mongoose.Types.ObjectId.isValid(routeId)) {
      return res.status(400).json({ error: 'Invalid route ID format' });
    }
    
    // Check if route exists
    const existingRoute = await Route.findById(routeId);
    if (!existingRoute) {
      return res.status(400).json({ error: 'Route not found' });
    }
    
    // Set expiry to 1 month from now
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    
    const newPass = new Pass({
      userId,
      routeId,
      fare: parseFloat(fare),
      expiryDate
    });
    
    await newPass.save();
    
    const populatedPass = await Pass.findById(newPass._id).populate('routeId');
    
    res.status(201).json({
      success: true,
      pass: populatedPass
    });
  } catch (error) {
    console.error('Error creating pass:', error);
    res.status(500).json({ error: 'Failed to create pass' });
  }
});

export default router;
