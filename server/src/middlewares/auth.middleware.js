// src/middlewares/auth.middleware.js
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../utils/token');
const User = require('../models/User.model');

/**
 * Protect — requires a valid Bearer access token
 */
const protect = asyncHandler(async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
  }
  const token = auth.split(' ')[1];
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }
  const user = await User.findById(decoded.id).select('+refreshTokenHash');
  if (!user) return next(new AppError('The user belonging to this token no longer exists.', 401));
  if (user.isBanned) return next(new AppError('Your account has been suspended.', 403));
  req.user = user;
  next();
});

/**
 * restrictTo — role-based access control
 */
const restrictTo = (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };

/**
 * optionalAuth — attach user if token present, but don't block if absent
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const decoded = verifyAccessToken(auth.split(' ')[1]);
      req.user = await User.findById(decoded.id);
    } catch {
      // ignore — optional
    }
  }
  next();
});

const adminOnly = restrictTo('admin');

module.exports = { protect, restrictTo, optionalAuth, adminOnly };
