
import express from 'express';
import Route from '../models/Route.js';

const router = express.Router();

// Get all routes
router.get('/', async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

// Get route by ID
router.get('/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json(route);
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({ error: 'Failed to fetch route' });
  }
});

// Create route
router.post('/', async (req, res) => {
  try {
    const { start, end, fare } = req.body;
    
    if (!start || !end || !fare) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newRoute = new Route({
      start,
      end,
      fare: parseFloat(fare)
    });
    
    await newRoute.save();
    res.status(201).json(newRoute);
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({ error: 'Failed to create route' });
  }
});

// Update route
router.put('/:id', async (req, res) => {
  try {
    const { start, end, fare } = req.body;
    
    if (!start || !end || !fare) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const updatedRoute = await Route.findByIdAndUpdate(
      req.params.id,
      { start, end, fare: parseFloat(fare) },
      { new: true }
    );
    
    if (!updatedRoute) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json(updatedRoute);
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).json({ error: 'Failed to update route' });
  }
});

// Delete route
router.delete('/:id', async (req, res) => {
  try {
    const deletedRoute = await Route.findByIdAndDelete(req.params.id);
    
    if (!deletedRoute) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({ error: 'Failed to delete route' });
  }
});

export default router;
