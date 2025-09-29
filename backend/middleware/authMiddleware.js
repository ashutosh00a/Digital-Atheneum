import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by id and exclude password
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      // Check if user is active
      if (!req.user.isActive) {
        res.status(401);
        throw new Error('Your account has been deactivated. Please contact support.');
      }

      // Generate new tokens if the current one is about to expire (within 5 minutes)
      const tokenExp = decoded.exp * 1000; // Convert to milliseconds
      const fiveMinutes = 5 * 60 * 1000;
      
      if (tokenExp - Date.now() < fiveMinutes) {
        const newTokens = generateToken(req.user._id);
        res.setHeader('X-New-Access-Token', newTokens.accessToken);
        res.setHeader('X-New-Refresh-Token', newTokens.refreshToken);
        res.setHeader('X-Token-Expires-In', newTokens.expiresIn);
      }

      next();
    } catch (error) {
      console.error('Auth error:', error);
      
      if (error.name === 'TokenExpiredError') {
        res.status(401);
        throw new Error('Token expired. Please refresh your session.');
      }
      
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

export { protect, admin }; 