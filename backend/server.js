const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { router: authRoutes } = require('./routes/auth');
const reportsRoutes = require('./routes/reports');
const usersRoutes = require('./routes/users');
const { initializeDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 5000 : 3001);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? false  // Same-origin requests only in production
    : [
        'http://localhost:3000', 
        'http://localhost:5000', 
        'http://0.0.0.0:5000', 
        'http://127.0.0.1:5000',
        'http://192.168.1.6:5000'  // Add your network IP
      ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes MUST come before catch-all React routing
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', usersRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Note: Static file serving is handled by Vercel, not needed in serverless functions

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// For Vercel serverless functions, we don't use app.listen()
// Database initialization is handled per-request via ensureInitialized()

module.exports = app;