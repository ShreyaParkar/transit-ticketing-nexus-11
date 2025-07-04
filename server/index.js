
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connect } from './utils/mongoConnect.js';
import routesRouter from './routes/routesRouter.js';
import busesRouter from './routes/busesRouter.js';
import stationsRouter from './routes/stationsRouter.js';
import ticketsRouter from './routes/ticketsRouter.js';
import passesRouter from './routes/passesRouter.js';
import passUsageRouter from './routes/passUsageRouter.js';
import ridesRouter from './routes/ridesRouter.js';
import tripsRouter from './routes/tripsRouter.js';
import usersRouter from './routes/usersRouter.js';
import paymentsRouter from './routes/paymentsRouter.js';
import checkoutRouter from './routes/checkoutRouter.js';
import walletRouter from './routes/walletRouter.js';
import webhookRouter from './routes/webhookRouter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration to handle preflight requests
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080', 'https://a52db94c-2dab-4cc4-8123-9d91b2b2c9fd.lovableproject.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight OPTIONS requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

// More lenient rate limiting middleware for development
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 200; // Increased limit for development

const rateLimiter = (req, res, next) => {
  const clientId = req.ip;
  const now = Date.now();
  
  if (!requestCounts.has(clientId)) {
    requestCounts.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const clientData = requestCounts.get(clientId);
  
  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ error: 'Too many requests, please try again later' });
  }
  
  clientData.count++;
  next();
};

// Apply rate limiting
app.use(rateLimiter);

// Webhook route MUST come before express.json() middleware
app.use('/api/webhook', webhookRouter);

// Regular JSON middleware for all other routes
app.use(express.json());

// Connect to MongoDB and wait for it to be ready
const startServer = async () => {
  try {
    await connect();
    console.log('Database connected, initializing routes...');
    
    // Add a delay to ensure models are fully loaded
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Routes with proper error handling
    app.use('/api/routes', routesRouter);
    app.use('/api/buses', busesRouter);
    app.use('/api/stations', stationsRouter);
    app.use('/api/tickets', ticketsRouter);
    app.use('/api/passes', passesRouter);
    app.use('/api/pass-usage', passUsageRouter);
    app.use('/api/rides', ridesRouter);
    app.use('/api/trips', tripsRouter);
    app.use('/api/users', usersRouter);
    app.use('/api/payments', paymentsRouter);
    app.use('/api/checkout', checkoutRouter);
    app.use('/api/wallet', walletRouter);

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
    });

    // Root endpoint
    app.get('/', (req, res) => {
      res.json({ message: 'Transit API Server', version: '1.0.0', status: 'running' });
    });

    // 404 handler for undefined routes
    app.use('*', (req, res) => {
      console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
      res.status(404).json({ 
        error: 'Route not found', 
        method: req.method, 
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Server error:', err);
      res.status(500).json({ 
        error: 'Internal server error', 
        message: err.message,
        timestamp: new Date().toISOString()
      });
    });

    console.log('Routes initialized, starting server...');
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

// Handle port conflicts gracefully
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is busy, trying port ${PORT + 1}`);
    server.listen(PORT + 1, () => {
      console.log(`🚀 Server running on port ${PORT + 1}`);
      console.log(`📍 Health check: http://localhost:${PORT + 1}/api/health`);
      console.log(`🔗 API base URL: http://localhost:${PORT + 1}/api`);
    });
  } else {
    console.error('❌ Server error:', err);
  }
});

// Initialize the server
startServer();
