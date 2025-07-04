
import express from 'express';
import Stripe from 'stripe';
import { connect } from '../utils/mongoConnect.js';
import Payment from '../models/Payment.js';
import Pass from '../models/Pass.js';
import Ticket from '../models/Ticket.js';
import Wallet from '../models/Wallet.js';
import Route from '../models/Route.js';
import Bus from '../models/Bus.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get payments by user ID
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const payments = await Payment.find({ userId })
      .populate('routeId')
      .sort({ _id: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Verify and confirm payment after Stripe checkout
router.post('/verify', async (req, res) => {
  try {
    await connect();
    
    const { userId, sessionId } = req.body;
    
    if (!userId || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('=== PAYMENT VERIFICATION ===');
    console.log('SessionId:', sessionId, 'UserId:', userId);

    // Retrieve Stripe session to verify payment
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment not completed' 
      });
    }

    // Find payment record
    const payment = await Payment.findOne({ stripeSessionId: sessionId });
    
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payment record not found' 
      });
    }

    if (payment.status === 'completed') {
      return res.json({ 
        success: true, 
        message: 'Payment already processed',
        data: payment 
      });
    }

    // Process based on payment type
    let result = null;
    
    if (payment.type === 'pass') {
      // Create pass
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      
      const newPass = new Pass({
        userId: payment.userId,
        routeId: payment.routeId,
        fare: payment.fare,
        expiryDate
      });
      
      await newPass.save();
      result = await Pass.findById(newPass._id).populate('routeId');
      console.log('Pass created:', result._id);
      
    } else if (payment.type === 'wallet') {
      // Add funds to wallet
      let wallet = await Wallet.findOne({ userId: payment.userId });
      if (!wallet) {
        wallet = new Wallet({ 
          userId: payment.userId, 
          balance: 0, 
          transactions: [] 
        });
      }
      
      await wallet.addFunds(payment.fare, 'Wallet top-up via Stripe');
      result = wallet;
      console.log('Wallet updated:', wallet.balance);
      
    } else if (payment.type === 'ticket') {
      // Create ticket
      const route = await Route.findById(payment.routeId);
      const bus = await Bus.findOne({ routeId: payment.routeId });
      
      if (!route || !bus) {
        return res.status(400).json({ 
          success: false, 
          error: 'Route or bus not found for ticket creation' 
        });
      }
      
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 24); // 24 hour validity
      
      const newTicket = new Ticket({
        userId: payment.userId,
        routeId: payment.routeId,
        busId: bus._id,
        startStation: route.start,
        endStation: route.end,
        price: payment.fare,
        paymentIntentId: sessionId,
        expiryDate
      });
      
      await newTicket.save();
      result = await Ticket.findById(newTicket._id)
        .populate('routeId')
        .populate('busId');
      console.log('Ticket created:', result._id);
    }

    // Mark payment as completed
    payment.status = 'completed';
    await payment.save();

    console.log('Payment verification completed successfully');
    
    res.json({
      success: true,
      data: result,
      payment: payment
    });
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify payment' 
    });
  }
});

// Legacy confirm endpoint for backward compatibility
router.post('/confirm', async (req, res) => {
  return router.post('/verify')(req, res);
});

// Update payment status
router.put('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const payment = await Payment.findOneAndUpdate(
      { stripeSessionId: sessionId },
      { status },
      { new: true }
    );
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

export default router;
