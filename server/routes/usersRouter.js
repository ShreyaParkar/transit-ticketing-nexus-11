
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get user by clerk ID
router.get('/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create or update user
router.post('/', async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName, username, avatar } = req.body;
    
    if (!clerkId || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const user = await User.findOneAndUpdate(
      { clerkId },
      {
        email,
        firstName,
        lastName,
        username,
        avatar
      },
      { new: true, upsert: true }
    );
    
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating or updating user:', error);
    res.status(500).json({ error: 'Failed to create or update user' });
  }
});

// Delete user
router.delete('/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const user = await User.findOneAndDelete({ clerkId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
