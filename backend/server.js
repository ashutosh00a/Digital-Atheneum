import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bookRoutes from './routes/bookRoutes.js';
import userRoutes from './routes/userRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import fs from 'fs';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import recommendationRoutes from './routes/recommendationRoutes.js';

// Load environment variables
dotenv.config();

// Debug logging for environment variables
console.log('Server.js - Environment variables loaded:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Track database connection state
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
  console.log('Connection State:', mongoose.connection.readyState);
  console.log('Database Name:', mongoose.connection.name);
  console.log('Host:', mongoose.connection.host);
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://frontend:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Request Headers:', req.headers);
  if (req.file) {
    console.log('Uploaded File:', req.file);
  }
  next();
});

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const profilePicturesDir = path.join(uploadsDir, 'profile-pictures');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(profilePicturesDir)) {
  fs.mkdirSync(profilePicturesDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint - must be before route mounting
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      connected: mongoose.connection.readyState === 1,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    }
  });
});

// Mount routes
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Root route with detailed database status
app.get('/', (req, res) => {
  const dbStatus = {
    connected: mongoose.connection.readyState === 1,
    state: mongoose.connection.readyState,
    database: mongoose.connection.name,
    host: mongoose.connection.host,
    collections: Object.keys(mongoose.connection.collections)
  };
  
  res.json({ 
    message: 'API is running...',
    dbStatus
  });
});

// Error middleware
app.use(notFound);
app.use(errorHandler);

// Start server with port fallback logic
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('Starting server initialization...');
    
    // Connect to MongoDB first
    console.log('Attempting to connect to MongoDB...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Using connection string:', process.env.MONGO_URI ? 'MONGO_URI' : 'MONGODB_URI');
    
    const dbConnected = await connectDB();
    
    if (!dbConnected) {
      throw new Error('Failed to connect to MongoDB');
    }
    
    console.log('MongoDB connection successful, starting server...');
    console.log('Connection details:', {
      state: mongoose.connection.readyState,
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      collections: Object.keys(mongoose.connection.collections)
    });

    // Start the server only after successful database connection
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log('MongoDB Connection Status:', {
        state: mongoose.connection.readyState,
        database: mongoose.connection.name,
        host: mongoose.connection.host
      });
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try a different port.`.red);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });

    // Handle process termination
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app; 