// src/controllers/report.controller.js
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const Report = require('../models/Report.model');

const mongoose = require('mongoose');
const Listing = require('../models/Listing.model');
const User = require('../models/User.model');
const AppError = require('../utils/AppError');

const createReport = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason } = req.body;
  if (!targetType || !targetId || !reason) {
    throw new AppError('targetType, targetId, and reason are required.', 400);
  }

  const normalizedType = targetType.charAt(0).toUpperCase() + targetType.slice(1).toLowerCase();
  if (!['Listing', 'User'].includes(normalizedType)) {
    throw new AppError('Invalid targetType. Must be Listing or User.', 400);
  }

  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    throw new AppError('Invalid targetId format.', 400);
  }

  const Model = normalizedType === 'Listing' ? Listing : User;
  const targetExists = await Model.findById(targetId);
  if (!targetExists) {
    throw new AppError(`${normalizedType} with this ID does not exist.`, 404);
  }

  const report = await Report.create({
    reporter: req.user._id,
    targetType: normalizedType,
    targetId,
    reason,
  });
  apiResponse(res, 201, 'Report submitted. Our team will review it shortly.', report);
});

module.exports = { createReport };
