
import express from 'express';
import mongoose from 'mongoose';
import Station from '../models/Station.js';
import Route from '../models/Route.js';
import Bus from '../models/Bus.js';

const router = express.Router();

// Get all stations
router.get('/', async (req, res) => {
  try {
    const { routeId, busId } = req.query;
    
    console.log('Fetching stations, routeId:', routeId, 'busId:', busId);
    
    let query = {};
    if (routeId) query.routeId = routeId;
    if (busId) query.busId = busId;
    
    const stations = await Station.find(query)
      .populate('routeId')
      .populate('busId');
    
    console.log('Stations found:', stations.length);
    res.json(stations);
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
});

// Create station
router.post('/', async (req, res) => {
  try {
    const { routeId, busId, name, latitude, longitude, fare, location } = req.body;
    
    console.log('Creating station with data:', { routeId, busId, name, latitude, longitude, fare, location });
    
    if (!routeId || !busId || !name || !latitude || !longitude || !fare) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(routeId)) {
      return res.status(400).json({ error: 'Invalid route ID format' });
    }
    if (!mongoose.Types.ObjectId.isValid(busId)) {
      return res.status(400).json({ error: 'Invalid bus ID format' });
    }

    // Check if route and bus exist
    const existingRoute = await Route.findById(routeId);
    if (!existingRoute) {
      return res.status(400).json({ error: 'Route not found' });
    }

    const existingBus = await Bus.findById(busId);
    if (!existingBus) {
      return res.status(400).json({ error: 'Bus not found' });
    }

    // Validate numeric fields
    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    const fareNum = parseFloat(fare);

    if (isNaN(latNum) || isNaN(lngNum) || isNaN(fareNum) || fareNum <= 0) {
      return res.status(400).json({ error: 'Invalid numeric values' });
    }
    
    const newStation = new Station({
      routeId,
      busId,
      name: name.trim(),
      latitude: latNum,
      longitude: lngNum,
      fare: fareNum,
      location: location || name.trim()
    });
    
    const savedStation = await newStation.save();
    console.log('Station created successfully:', savedStation);
    
    res.status(201).json(savedStation);
  } catch (error) {
    console.error('Error creating station:', error);
    
    // Handle specific mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: `Validation failed: ${validationErrors.join(', ')}` });
    }
    
    res.status(500).json({ error: 'Failed to create station' });
  }
});

// Update station
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { routeId, busId, name, latitude, longitude, fare, location } = req.body;
    
    console.log('Updating station with data:', { id, routeId, busId, name, latitude, longitude, fare, location });
    
    if (!routeId || !busId || !name || !latitude || !longitude || !fare) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid station ID format' });
    }
    if (!mongoose.Types.ObjectId.isValid(routeId)) {
      return res.status(400).json({ error: 'Invalid route ID format' });
    }
    if (!mongoose.Types.ObjectId.isValid(busId)) {
      return res.status(400).json({ error: 'Invalid bus ID format' });
    }

    // Check if route and bus exist
    const existingRoute = await Route.findById(routeId);
    if (!existingRoute) {
      return res.status(400).json({ error: 'Route not found' });
    }

    const existingBus = await Bus.findById(busId);
    if (!existingBus) {
      return res.status(400).json({ error: 'Bus not found' });
    }

    // Validate numeric fields
    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    const fareNum = parseFloat(fare);

    if (isNaN(latNum) || isNaN(lngNum) || isNaN(fareNum) || fareNum <= 0) {
      return res.status(400).json({ error: 'Invalid numeric values' });
    }
    
    const updatedStation = await Station.findByIdAndUpdate(
      id,
      {
        routeId,
        busId,
        name: name.trim(),
        latitude: latNum,
        longitude: lngNum,
        fare: fareNum,
        location: location || name.trim()
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedStation) {
      return res.status(404).json({ error: 'Station not found' });
    }
    
    console.log('Station updated successfully:', updatedStation);
    res.json(updatedStation);
  } catch (error) {
    console.error('Error updating station:', error);
    
    // Handle specific mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: `Validation failed: ${validationErrors.join(', ')}` });
    }
    
    res.status(500).json({ error: 'Failed to update station' });
  }
});

// Delete station
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Deleting station with id:', id);
    
    // Validate that id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid station ID format' });
    }
    
    const deletedStation = await Station.findByIdAndDelete(id);
    
    if (!deletedStation) {
      return res.status(404).json({ error: 'Station not found' });
    }
    
    console.log('Station deleted successfully:', deletedStation);
    res.json({ message: 'Station deleted successfully' });
  } catch (error) {
    console.error('Error deleting station:', error);
    res.status(500).json({ error: 'Failed to delete station' });
  }
});

export default router;
