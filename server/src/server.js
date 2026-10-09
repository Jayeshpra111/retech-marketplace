// src/server.js — HTTP server + DB connect + Socket.io init
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const { PORT, CLIENT_URL } = require('./config/env');
const logger = require('./config/logger');
const initSocket = require('./sockets/index');
const { startCronJobs } = require('./utils/cronJobs');

const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────────────────
const allowedOrigins = CLIENT_URL.split(',').map((u) => u.trim()).filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        origin.endsWith('.vercel.app') ||
        origin === 'https://retech-marketplace.vercel.app'
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Socket CORS disallowed: ${origin}`));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
app.set('io', io); // make io available in controllers via req.app.get('io')
initSocket(io);

// ── Start ─────────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  startCronJobs();
  server.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'Unhandled rejection — shutting down');
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received — shutting down gracefully');
  server.close(() => process.exit(0));
});

start();
