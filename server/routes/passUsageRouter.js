
import express from 'express';
import mongoose from 'mongoose';
import PassUsage from '../models/PassUsage.js';
import Pass from '../models/Pass.js';

const router = express.Router();

// Get usage history by user ID
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const usageHistory = await PassUsage.find({ userId })
      .populate('passId')
      .sort({ scannedAt: -1 });
    
    res.json(usageHistory);
  } catch (error) {
    console.error('Error fetching pass usage history:', error);
    res.status(500).json({ error: 'Failed to fetch pass usage history' });
  }
});

// Record pass usage
router.post('/', async (req, res) => {
  try {
    const { userId, passId, location } = req.body;
    
    if (!userId || !passId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate passId
    if (!mongoose.Types.ObjectId.isValid(passId)) {
      return res.status(400).json({ error: 'Invalid pass ID format' });
    }

    // Check if pass exists
    const existingPass = await Pass.findById(passId);
    if (!existingPass) {
      return res.status(400).json({ error: 'Pass not found' });
    }

    // Optional: check if pass belongs to the user
    if (existingPass.userId !== userId) {
        return res.status(403).json({ error: 'Pass does not belong to this user' });
    }

    // Optional: check if pass is expired
    if (new Date(existingPass.expiryDate) < new Date()) {
        return res.status(400).json({ error: 'Pass has expired' });
    }
    
    const newUsage = new PassUsage({
      userId,
      passId,
      location,
      scannedAt: new Date()
    });
    
    const savedUsage = await newUsage.save();
    const populatedUsage = await PassUsage.findById(savedUsage._id).populate('passId');
    
    res.status(201).json({
      message: 'Pass usage recorded successfully',
      usage: populatedUsage
    });
  } catch (error) {
    console.error('Error recording pass usage:', error);
    res.status(500).json({ error: 'Failed to record pass usage' });
  }
});

export default router;
