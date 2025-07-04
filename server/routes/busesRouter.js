
import express from 'express';
import mongoose from 'mongoose';
import Bus from '../models/Bus.js';
import Route from '../models/Route.js';

const router = express.Router();

// Get all buses
router.get('/', async (req, res) => {
  try {
    const { routeId } = req.query;
    
    console.log('GET /buses - routeId:', routeId);
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    console.log('Bus model available:', !!Bus);
    console.log('Bus model methods:', Object.getOwnPropertyNames(Bus));
    
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected, state:', mongoose.connection.readyState);
      return res.status(500).json({ error: 'Database connection failed' });
    }

    // Verify Bus model is properly initialized
    if (!Bus || typeof Bus.find !== 'function') {
      console.error('Bus model not properly initialized');
      return res.status(500).json({ error: 'Bus model initialization failed' });
    }
    
    let query = {};
    if (routeId && mongoose.Types.ObjectId.isValid(routeId)) {
      query.route = routeId;
    }
    
    console.log('Query:', query);
    
    // Use proper error handling for the database query
    const buses = await Bus.find(query).populate('route').lean();
    console.log('Found buses:', buses.length);
    
    res.json(buses);
  } catch (error) {
    console.error('Error fetching buses:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch buses', 
      details: error.message,
      dbState: mongoose.connection.readyState 
    });
  }
});

// Create a new bus
router.post('/', async (req, res) => {
  try {
    const { name, route, capacity } = req.body;
    
    console.log('POST /buses - Creating bus with:', { name, route, capacity });
    
    // Validation
    if (!name || !route || !capacity) {
      console.error('Missing required fields:', { name: !!name, route: !!route, capacity: !!capacity });
      return res.status(400).json({ error: 'Missing required fields: name, route, and capacity are required' });
    }

    // Validate route ID format
    if (!mongoose.Types.ObjectId.isValid(route)) {
      console.error('Invalid route ID format:', route);
      return res.status(400).json({ error: 'Invalid route ID format' });
    }

    // Check if route exists
    const existingRoute = await Route.findById(route);
    if (!existingRoute) {
      console.error('Route not found:', route);
      return res.status(400).json({ error: 'Route not found' });
    }

    // Validate capacity
    const capacityNum = parseInt(capacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      console.error('Invalid capacity:', capacity);
      return res.status(400).json({ error: 'Capacity must be a positive number' });
    }
    
    const newBus = new Bus({
      name: name.trim(),
      route: route,
      capacity: capacityNum,
    });
    
    console.log('Creating new bus:', newBus);
    const savedBus = await newBus.save();
    console.log('Bus created successfully:', savedBus);
    
    // Populate the route for the response
    const populatedBus = await Bus.findById(savedBus._id).populate('route');
    
    res.status(201).json(populatedBus);
  } catch (error) {
    console.error('Error creating bus:', error);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: `Validation failed: ${validationErrors.join(', ')}` });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ error: `A bus with this ${field} already exists` });
    }
    
    res.status(500).json({ error: 'Failed to create bus', details: error.message });
  }
});

// Update a bus
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, route, capacity } = req.body;
    
    console.log('PUT /buses/:id - Updating bus:', { id, name, route, capacity });
    
    if (!name || !route || !capacity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid bus ID format' });
    }

    if (!mongoose.Types.ObjectId.isValid(route)) {
      return res.status(400).json({ error: 'Invalid route ID format' });
    }

    const existingRoute = await Route.findById(route);
    if (!existingRoute) {
      return res.status(400).json({ error: 'Route not found' });
    }

    const capacityNum = parseInt(capacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      return res.status(400).json({ error: 'Capacity must be a positive number' });
    }
    
    const updatedBus = await Bus.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        route: route,
        capacity: capacityNum,
      },
      { new: true, runValidators: true }
    ).populate('route');
    
    if (!updatedBus) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    
    console.log('Bus updated successfully:', updatedBus);
    res.json(updatedBus);
  } catch (error) {
    console.error('Error updating bus:', error);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: `Validation failed: ${validationErrors.join(', ')}` });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ error: `A bus with this ${field} already exists` });
    }
    
    res.status(500).json({ error: 'Failed to update bus', details: error.message });
  }
});

// Delete a bus
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('DELETE /buses/:id - Deleting bus:', id);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid bus ID format' });
    }
    
    const deletedBus = await Bus.findByIdAndDelete(id);
    
    if (!deletedBus) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    
    console.log('Bus deleted successfully:', deletedBus);
    res.json({ message: 'Bus deleted successfully' });
  } catch (error) {
    console.error('Error deleting bus:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to delete bus', details: error.message });
  }
});

export default router;
