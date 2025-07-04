
import express from 'express';
import mongoose from 'mongoose';
import Ticket from '../models/Ticket.js';
import Route from '../models/Route.js';
import Bus from '../models/Bus.js';

const router = express.Router();

// Get tickets by user ID
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const tickets = await Ticket.find({ userId })
      .populate('routeId')
      .populate('busId')
      .sort({ createdAt: -1 });
    
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Create ticket
router.post('/', async (req, res) => {
  try {
    const { userId, routeId, busId, startStation, endStation, price, paymentIntentId, expiryDate } = req.body;
    
    if (!userId || !routeId || !busId || !startStation || !price || !paymentIntentId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(routeId)) {
      return res.status(400).json({ error: 'Invalid route ID format' });
    }
    if (!mongoose.Types.ObjectId.isValid(busId)) {
      return res.status(400).json({ error: 'Invalid bus ID format' });
    }

    // Check if documents exist
    const [existingRoute, existingBus] = await Promise.all([
      Route.findById(routeId),
      Bus.findById(busId)
    ]);

    if (!existingRoute) {
      return res.status(400).json({ error: 'Route not found' });
    }
    if (!existingBus) {
      return res.status(400).json({ error: 'Bus not found' });
    }
    
    const newTicket = new Ticket({
      userId,
      routeId,
      busId,
      startStation,
      endStation: endStation || startStation,
      price: parseFloat(price),
      paymentIntentId,
      expiryDate: expiryDate || new Date(Date.now() + 24 * 60 * 60 * 1000) // Default to 24hrs from now
    });
    
    await newTicket.save();

    const populatedTicket = await Ticket.findById(newTicket._id)
      .populate('routeId')
      .populate('busId');
    
    res.status(201).json({
      success: true,
      ticket: populatedTicket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: `Validation failed: ${validationErrors.join(', ')}` });
    }
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

export default router;
