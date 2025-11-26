import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Basic middleware
app.use(express.json());

// Only ONE test route to check if server works
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  });
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventapp');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
};

connectDB();
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 Test here: http://localhost:${PORT}/api/health`);
});