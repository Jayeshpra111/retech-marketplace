// src/controllers/auth.controller.js
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const { setRefreshCookie, clearRefreshCookie } = require('../utils/token');
const authService = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
  const { user } = await authService.register(req.body);
  apiResponse(res, 201, 'Registration successful. Please check your email to verify your account.', {
    user: { id: user._id, name: user.name, email: user.email },
  });
});

const login = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken);
  apiResponse(res, 200, 'Logged in successfully.', {
    accessToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isEmailVerified: user.isEmailVerified },
  });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);
  clearRefreshCookie(res);
  apiResponse(res, 200, 'Logged out successfully.');
});

const refresh = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.refreshToken;
  if (!rawToken) {
    return res.status(401).json({ success: false, message: 'No refresh token.' });
  }
  const { accessToken, refreshToken } = await authService.refresh(rawToken);
  setRefreshCookie(res, refreshToken);
  apiResponse(res, 200, 'Token refreshed.', { accessToken });
});

const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.params.token);
  apiResponse(res, 200, 'Email verified successfully. You can now log in.');
});

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  // Always respond with 200 to avoid revealing if email exists
  apiResponse(res, 200, 'If an account with that email exists, a password reset link has been sent.');
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.params.token, req.body.password);
  apiResponse(res, 200, 'Password reset successful. Please log in with your new password.');
});

module.exports = { register, login, logout, refresh, verifyEmail, forgotPassword, resetPassword };
