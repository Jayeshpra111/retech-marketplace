// src/config/db.js — mongoose connection
const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    const msg = err.message || '';
    if (err.code === 8000 || /auth|password/i.test(msg)) {
      logger.error('MongoDB connection failed: wrong username or password.');
    } else if (/whitelist|firewall|timed out|Server selection timed out/i.test(msg) || err.name === 'MongooseServerSelectionError') {
      logger.error(`MongoDB connection failed: IP address not allowed in Atlas Network Access, cluster unreachable, or connection timed out.`);
    } else if (/invalid connection string|scheme|parse/i.test(msg) || err.name === 'MongoParseError') {
      logger.error('MongoDB connection failed: invalid connection string.');
    } else {
      logger.error(`MongoDB connection failed: ${err.name || 'connection error'}`);
    }
    process.exit(1);
  }
};

module.exports = connectDB;
