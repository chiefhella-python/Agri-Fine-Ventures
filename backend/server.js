// ============================================
// AGRI-FINE VENTURES — BACKEND SERVER
// Node.js Express API for greenhouse management
// ============================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import routes
const greenhouseRoutes = require('./routes/greenhouses');
const sensorRoutes = require('./routes/sensors');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const workerRoutes = require('./routes/workers');
const db = require('./config/database');
const { testSupabaseConnection } = require('./config/supabase');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.gstatic.com", "https://cdn.jsdelivr.net"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
      connectSrc: ["'self'", "https://api.open-meteo.com"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));

// Compression - improves response times
app.use(compression());

// Only log in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting - General API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting - Auth endpoints (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per windowMs
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting - Login specific (strictest)
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 login attempts per minute
  message: { error: 'Too many login attempts, please wait a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiters
app.use('/api/', generalLimiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', authLimiter);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/greenhouses', greenhouseRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Agri-Fine Ventures API',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// For SPA routing - serve index.html for any non-API routes that don't match static files
app.get(/^\/(?!api)[^.]*$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🌱 Agri-Fine Ventures API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize PostgreSQL database (optional - server works without it)
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
    try {
      await db.initializeDatabase();
      await db.initializeGreenhouses();
      console.log('✅ Database initialized');
    } catch (err) {
      console.log('⚠️ Database connection failed:', err.message);
    }
  } else {
    console.log('⚠️ DATABASE_URL not configured - running without database');
  }
  
  // Test Supabase connection if credentials provided
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && !process.env.SUPABASE_URL.includes('[YOUR-')) {
    try {
      await testSupabaseConnection();
    } catch (err) {
      console.log('⚠️ Supabase connection failed:', err.message);
    }
  }
});

module.exports = app;
