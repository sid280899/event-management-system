import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import profileRoutes from './routes/profiles.js';
import eventRoutes from './routes/events.js';

dotenv.config();

const app = express();

// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:5173',           // Local development
    'http://127.0.0.1:5173',           // Local development
    'https://event-management-system-wy4i-mwkazodtc.vercel.app', // Production frontend
    'https://event-management-system-wy4i.vercel.app' 
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root endpoint - API welcome page
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Event Management API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    documentation: 'Visit /api/health for service status',
    endpoints: {
      health: '/api/health',
      profiles: '/api/profiles',
      events: '/api/events'
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Event Management API is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/profiles', profileRoutes);
app.use('/api/events', eventRoutes);

// 404 handler - Catch all undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
    requestedPath: req.originalUrl,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET/POST/PUT/DELETE /api/profiles',
      'GET/POST/PUT/DELETE /api/events'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
  });
});

// Connection state tracking for serverless environments
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('✅ Using existing database connection');
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // Optimized for serverless
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    });
    
    isConnected = true;
    console.log('✅ Connected to MongoDB successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

// Connect to database on cold start
connectDB().catch(console.error);


// Export the app for Vercel serverless functions
export default app;