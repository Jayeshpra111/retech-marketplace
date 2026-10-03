// src/app.js — Express application setup
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
// Express 5 exposes req.query as read-only, so sanitize mutable inputs before routing.
const sanitizeValue = (val) => {
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.map(sanitizeValue);
  if (val && typeof val === 'object') {
    return Object.fromEntries(
      Object.entries(val)
        .filter(([k]) => !k.startsWith('$') && !k.includes('.'))
        .map(([k, v]) => [k, sanitizeValue(v)])
    );
  }
  return val;
};
const mongoSanitize = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};
const morgan = require('morgan');
const { CLIENT_URL, NODE_ENV } = require('./config/env');
const { defaultLimiter } = require('./middlewares/rateLimit.middleware');
const errorMiddleware = require('./middlewares/error.middleware');
const apiRoutes = require('./routes/index');

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

// ── Request parsing ───────────────────────────────────────────────────────────
// Raw body for webhook (must come before express.json)
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ── NoSQL injection prevention ────────────────────────────────────────────────
app.use(mongoSanitize);

// ── HTTP logging ──────────────────────────────────────────────────────────────
if (NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Global rate limiter ───────────────────────────────────────────────────────
app.use('/api', defaultLimiter);

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/v1', apiRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
