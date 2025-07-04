
import jwt from 'jsonwebtoken';

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    
    const token = authHeader.substring(7);
    
    // For development, accept dummy tokens
    if (token === 'dummy-auth-token') {
      req.user = {
        id: 'dummy-user',
        email: 'dummy@example.com',
        role: 'user'
      };
      return next();
    }
    
    try {
      // Try to decode the JWT token (Clerk tokens are JWTs)
      const decoded = jwt.decode(token, { complete: true });
      
      if (decoded && decoded.payload) {
        // Extract user info from Clerk token
        const payload = decoded.payload;
        req.user = {
          id: payload.sub || payload.userId || token.substring(0, 20),
          email: payload.email || 'user@example.com',
          role: payload.role || 'user'
        };
        
        console.log('Authenticated user:', req.user.id);
        return next();
      }
      
      // If JWT decode fails, treat as simple token
      req.user = {
        id: token.length > 20 ? token.substring(0, 20) : token,
        email: 'user@example.com',
        role: 'user'
      };
      
      console.log('Authenticated user (fallback):', req.user.id);
      next();
      
    } catch (jwtError) {
      console.log('JWT decode failed, using fallback auth:', jwtError.message);
      req.user = {
        id: token.length > 20 ? token.substring(0, 20) : token,
        email: 'user@example.com',
        role: 'user'
      };
      
      console.log('Authenticated user (error fallback):', req.user.id);
      next();
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

export const requireOwnership = (userIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const resourceUserId = req.body[userIdField] || req.params[userIdField] || req.query[userIdField];
    
    console.log('Checking ownership:', {
      authUserId: req.user.id,
      resourceUserId,
      userRole: req.user.role
    });
    
    // For development, allow access if user is authenticated
    if (req.user.role === 'admin' || req.user.id === resourceUserId || req.user.id === 'dummy-user') {
      return next();
    }
    
    // Also check if the resource user ID contains parts of the auth user ID
    if (resourceUserId && req.user.id && resourceUserId.includes(req.user.id.substring(0, 10))) {
      return next();
    }
    
    return res.status(403).json({ error: 'Access denied' });
  };
};

// Rate limiting for sensitive operations
export const createAuthRateLimit = () => {
  return (req, res, next) => {
    // Simple in-memory rate limiting (in production, use Redis)
    const key = req.ip;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 20; // Increased for development
    
    if (!global.authAttempts) {
      global.authAttempts = new Map();
    }
    
    const attempts = global.authAttempts.get(key) || [];
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return res.status(429).json({ error: 'Too many authentication attempts' });
    }
    
    validAttempts.push(now);
    global.authAttempts.set(key, validAttempts);
    
    next();
  };
};
