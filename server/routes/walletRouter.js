
import express from 'express';
import Wallet from '../models/Wallet.js';
import { authenticateUser, requireOwnership } from '../middleware/auth.js';
import { paymentRateLimit, validateWallet, sanitizeInput, securityLogger } from '../middleware/security.js';

const router = express.Router();

// Apply security middleware
router.use(securityLogger);
router.use(sanitizeInput);

// Get wallet balance
router.get('/:userId', authenticateUser, requireOwnership('userId'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    let wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      // Create new wallet if doesn't exist
      wallet = new Wallet({ userId, balance: 0, transactions: [] });
      await wallet.save();
    }
    
    res.json(wallet);
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// Add funds to wallet
router.post('/:userId/add', authenticateUser, requireOwnership('userId'), paymentRateLimit, validateWallet, async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;
    
    if (!amount || amount <= 0 || amount > 10000) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    let wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      wallet = new Wallet({ userId, balance: 0, transactions: [] });
    }
    
    await wallet.addFunds(amount, 'Wallet top-up via Stripe');
    
    console.log('Funds added:', { userId, amount, timestamp: new Date().toISOString() });
    
    res.json({ 
      success: true, 
      message: 'Funds added successfully',
      wallet 
    });
  } catch (error) {
    console.error('Error adding funds:', error);
    res.status(500).json({ error: 'Failed to add funds' });
  }
});

// Deduct funds from wallet
router.post('/:userId/deduct', authenticateUser, requireOwnership('userId'), validateWallet, async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, description, rideId } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    const wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    await wallet.deductFunds(amount, description || 'Payment', rideId);
    
    console.log('Funds deducted:', { userId, amount, description, timestamp: new Date().toISOString() });
    
    res.json({ 
      success: true, 
      message: 'Funds deducted successfully',
      wallet 
    });
  } catch (error) {
    console.error('Error deducting funds:', error);
    if (error.message === 'Insufficient funds') {
      res.status(400).json({ error: 'Insufficient funds' });
    } else {
      res.status(500).json({ error: 'Failed to deduct funds' });
    }
  }
});

// Get transaction history
router.get('/:userId/transactions', authenticateUser, requireOwnership('userId'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    const wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      return res.json([]);
    }
    
    res.json(wallet.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;
