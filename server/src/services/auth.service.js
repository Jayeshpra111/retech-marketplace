// src/services/auth.service.js
const crypto = require('crypto');
const User = require('../models/User.model');
const AppError = require('../utils/AppError');
const { signAccessToken, signRefreshToken, hashToken, verifyRefreshToken } = require('../utils/token');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/sendEmail');
const { CLIENT_URL } = require('../config/env');

const issueTokens = (user) => {
  const payload = { id: user._id, role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

// ── Register ──────────────────────────────────────────────────────────────────
const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('An account with this email already exists.', 409);

  const user = await User.create({ name, email, password });

  const rawToken = user.createEmailVerifyToken();
  await user.save({ validateBeforeSave: false });

  await sendVerificationEmail(email, name, rawToken, CLIENT_URL);

  return { user };
};

// ── Login ─────────────────────────────────────────────────────────────────────
const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password +refreshTokenHash');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }
  if (user.isBanned) throw new AppError('Your account has been suspended.', 403);

  const { accessToken, refreshToken } = issueTokens(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken, user };
};

// ── Logout ────────────────────────────────────────────────────────────────────
const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
};

// ── Refresh Token ─────────────────────────────────────────────────────────────
const refresh = async (rawRefreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token.', 401);
  }

  const user = await User.findById(decoded.id).select('+refreshTokenHash');
  if (!user) throw new AppError('User not found.', 401);

  const hashed = hashToken(rawRefreshToken);
  if (user.refreshTokenHash !== hashed) {
    // Reuse detected — invalidate session entirely
    await User.findByIdAndUpdate(decoded.id, { refreshTokenHash: null });
    throw new AppError('Token reuse detected. Please log in again.', 401);
  }

  const { accessToken, refreshToken: newRefreshToken } = issueTokens(user);
  user.refreshTokenHash = hashToken(newRefreshToken);
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken: newRefreshToken };
};

// ── Verify Email ──────────────────────────────────────────────────────────────
const verifyEmail = async (rawToken) => {
  const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
  const user = await User.findOne({
    emailVerifyToken: hashed,
    emailVerifyExpires: { $gt: Date.now() },
  }).select('+emailVerifyToken +emailVerifyExpires');

  if (!user) throw new AppError('Token is invalid or has expired.', 400);

  user.isEmailVerified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;
  await user.save({ validateBeforeSave: false });
};

// ── Forgot Password ───────────────────────────────────────────────────────────
const forgotPassword = async (email) => {
  const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');
  if (!user) {
    // Don't reveal if email exists
    return;
  }
  const rawToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  await sendPasswordResetEmail(email, user.name, rawToken, CLIENT_URL);
};

// ── Reset Password ────────────────────────────────────────────────────────────
const resetPassword = async (rawToken, newPassword) => {
  const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires +password');

  if (!user) throw new AppError('Token is invalid or has expired.', 400);

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokenHash = undefined; // invalidate all sessions
  await user.save();
};

module.exports = { register, login, logout, refresh, verifyEmail, forgotPassword, resetPassword };
