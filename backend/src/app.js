const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
require('dotenv').config();

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { isDbConnected } = require('./config/db');
const { ensureDbConnected } = require('./middleware/dbCheck');

const app = express();

// 1. Trust proxy if running behind reverse proxy like Render / Heroku
app.set('trust proxy', 1);

// 2. Helmet Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 3. CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Check if origin matches or is a vercel.app preview URL for the project
      const isAllowed =
        allowedOrigins.includes(origin) ||
        (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) ||
        /\.vercel\.app$/.test(origin);

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 4. Request Logging (skip in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// 5. Response Compression
app.use(compression());

// 6. Body & Cookie Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 7. Lightweight Health Check (Render web service requirement)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'prince-digital-api',
    uptime: process.uptime(),
    database: isDbConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// 8. General API Rate Limiting & API v1 Routes (with DB readiness check)
app.use('/api/v1', ensureDbConnected, apiLimiter, routes);

// 8. 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
});

// 9. Centralized Error Handler
app.use(errorHandler);

module.exports = app;
