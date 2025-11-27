import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import profileRoutes from './routes/profiles.js';
import eventRoutes from './routes/events.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://event-management-system-wy4i.vercel.app',
    'https://event-manageme-git-af4ebe-siddheshneharkar70-gmailcoms-projects.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('✅ Using existing database connection');
    return;
  }
  
  try {
    console.log('🔄 Attempting MongoDB connection...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = true;
    console.log('✅ Connected to MongoDB successfully');
    
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

connectDB().catch(console.error);

const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not ready. Please try again in a moment.',
      databaseStatus: mongoose.connection.readyState
    });
  }
  next();
};

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
    environment: process.env.NODE_ENV || 'development',
    databaseStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Event Management API is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/profiles', checkDBConnection, profileRoutes);
app.use('/api/events', checkDBConnection, eventRoutes);

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

app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
  });
});

export default app;