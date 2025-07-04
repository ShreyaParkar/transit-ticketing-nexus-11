
import express from 'express';
import Stripe from 'stripe';
import { connect } from '../utils/mongoConnect.js';
import Payment from '../models/Payment.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create checkout session
router.post('/', async (req, res) => {
  try {
    console.log('=== CHECKOUT REQUEST ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    await connect();
    
    const { userId, type, amount, stationId, busId, routeId } = req.body;
    
    // Validate required fields
    if (!userId) {
      console.error('Missing userId field');
      return res.status(400).json({ error: 'Missing required field: userId' });
    }
    
    if (!type) {
      console.error('Missing type field');
      return res.status(400).json({ error: 'Missing required field: type' });
    }
    
    if (!amount || amount <= 0) {
      console.error('Missing or invalid amount field');
      return res.status(400).json({ error: 'Missing or invalid required field: amount' });
    }

    // Validate type-specific requirements
    if (type === 'ticket' && (!stationId || !busId)) {
      console.error('Missing stationId or busId for ticket type');
      return res.status(400).json({ error: 'Missing required fields for ticket: stationId and busId' });
    }
    
    if (type === 'pass' && !routeId) {
      console.error('Missing routeId for pass type');
      return res.status(400).json({ error: 'Missing required field for pass: routeId' });
    }

    // Determine product name based on type
    let productName = 'Payment';
    switch (type) {
      case 'wallet':
        productName = 'Wallet Top-up';
        break;
      case 'pass':
        productName = 'Monthly Transit Pass';
        break;
      case 'ticket':
        productName = 'Bus Ticket';
        break;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            unit_amount: Math.round(amount * 100), // Convert to paise
            product_data: {
              name: productName,
              description: `${productName} for transit services`,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:5173'}/${type === 'wallet' ? 'wallet' : type}?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5173'}/${type === 'wallet' ? 'wallet' : type}?status=cancel`,
      metadata: {
        userId,
        type,
        routeId: routeId || '',
        stationId: stationId || '',
        busId: busId || '',
      },
    });

    // Create payment record
    const payment = new Payment({
      userId,
      type,
      routeId: routeId || null,
      fare: amount,
      stripeSessionId: session.id,
      status: 'pending'
    });

    await payment.save();

    console.log('=== CHECKOUT RESPONSE ===');
    console.log('Stripe session created:', session.id);
    console.log('Payment record created:', payment._id);
    
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('=== CHECKOUT ERROR ===');
    console.error('Checkout error:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
});

// Health check for checkout service
router.get('/health', (req, res) => {
  console.log('Checkout service health check');
  res.json({ 
    status: 'OK', 
    service: 'checkout',
    timestamp: new Date().toISOString() 
  });
});

export default router;
