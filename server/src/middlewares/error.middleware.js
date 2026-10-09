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
const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File size limit exceeded. Maximum 5MB per file.', 400);
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files uploaded. Maximum 6 images allowed.', 400);
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError(`Unexpected upload field: ${err.field}`, 400);
  }
  return new AppError(`Upload error: ${err.message}`, 400);
};

const errorMiddleware = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  // Mongoose & Auth errors
  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKey(err);
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
  if (err.name === 'MulterError') error = handleMulterError(err);

  const statusCode = error.statusCode || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  if (statusCode >= 500) {
    logger.error({ err, req: { method: req.method, url: req.url } }, 'Internal server error');
  }

  const responseMessage =
    statusCode >= 500 && isProduction
      ? 'An unexpected server error occurred. Please try again later.'
      : error.message || 'Something went wrong';

  res.status(statusCode).json({
    success: false,
    message: responseMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
