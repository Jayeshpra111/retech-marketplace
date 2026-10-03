// src/controllers/user.controller.js
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const userService = require('../services/user.service');

const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getMe(req.user._id);
  apiResponse(res, 200, 'User fetched.', user);
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateMe(req.user._id, req.body);
  apiResponse(res, 200, 'Profile updated.', user);
});

const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
  const user = await userService.updateAvatar(req.user._id, req.file);
  apiResponse(res, 200, 'Avatar updated.', { avatar: user.avatar });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const data = await userService.getUserProfile(req.params.id);
  apiResponse(res, 200, 'User profile fetched.', data);
});

module.exports = { getMe, updateMe, updateAvatar, getUserProfile };
