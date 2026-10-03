// src/middlewares/error.middleware.js
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

const handleCastError = (err) => new AppError(`Invalid ${err.path}: ${err.value}`, 400);
const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`A record with this ${field} already exists.`, 409);
};
const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message).join('. ');
  return new AppError(`Validation failed: ${messages}`, 400);
};
const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again.', 401);

const errorMiddleware = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  // Mongoose errors
  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKey(err);
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';

  if (statusCode >= 500) {
    logger.error({ err, req: { method: req.method, url: req.url } }, 'Internal server error');
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
