import express from 'express';
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 Test here: http://localhost:${PORT}/api/health`);
});