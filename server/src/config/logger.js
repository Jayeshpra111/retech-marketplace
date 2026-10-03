// src/config/logger.js — Pino logger instance
const pino = require('pino');
const { NODE_ENV } = require('./env');

const logger = pino({
  level: NODE_ENV === 'production' ? 'info' : 'debug',
  ...(NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
    },
  }),
});

module.exports = logger;
