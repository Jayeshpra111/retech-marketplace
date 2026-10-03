// src/controllers/impact.controller.js
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const Listing = require('../models/Listing.model');
const Order = require('../models/Order.model');
const User = require('../models/User.model');

const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

const getImpactSummary = asyncHandler(async (req, res) => {
  const result = await Order.aggregate([
    { $match: { orderStatus: 'completed' } },
    {
      $lookup: {
        from: 'listings',
        localField: 'listing',
        foreignField: '_id',
        as: 'listingData',
      },
    },
    {
      $project: {
        effectiveImpactKg: {
          $ifNull: ['$impactKg', { $arrayElemAt: ['$listingData.impactKg', 0] }, 0],
        },
        effectiveCo2SavedKg: {
          $ifNull: ['$co2SavedKg', { $arrayElemAt: ['$listingData.co2SavedKg', 0] }, 0],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalImpactKg: { $sum: '$effectiveImpactKg' },
        totalCo2SavedKg: { $sum: '$effectiveCo2SavedKg' },
        totalItemsReused: { $sum: 1 },
      },
    },
  ]);
  const summary = result[0] || { totalImpactKg: 0, totalCo2SavedKg: 0, totalItemsReused: 0 };
  apiResponse(res, 200, 'Impact summary fetched.', {
    totalImpactKg: Math.round(summary.totalImpactKg * 10) / 10,
    totalCo2SavedKg: Math.round(summary.totalCo2SavedKg * 10) / 10,
    totalItemsReused: summary.totalItemsReused,
  });
});

const getUserImpact = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('Invalid user ID format.', 400);
  }
  const userObjId = new mongoose.Types.ObjectId(req.params.id);

  const result = await Order.aggregate([
    {
      $match: {
        $or: [{ seller: userObjId }, { buyer: userObjId }],
        orderStatus: 'completed',
      },
    },
    {
      $lookup: {
        from: 'listings',
        localField: 'listing',
        foreignField: '_id',
        as: 'listingData',
      },
    },
    {
      $project: {
        effectiveImpactKg: {
          $ifNull: ['$impactKg', { $arrayElemAt: ['$listingData.impactKg', 0] }, 0],
        },
        effectiveCo2SavedKg: {
          $ifNull: ['$co2SavedKg', { $arrayElemAt: ['$listingData.co2SavedKg', 0] }, 0],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalImpactKg: { $sum: '$effectiveImpactKg' },
        totalCo2SavedKg: { $sum: '$effectiveCo2SavedKg' },
        totalItemsReused: { $sum: 1 },
      },
    },
  ]);
  const impact = result[0] || { totalImpactKg: 0, totalCo2SavedKg: 0, totalItemsReused: 0 };
  apiResponse(res, 200, 'User impact fetched.', {
    totalImpactKg: Math.round(impact.totalImpactKg * 10) / 10,
    totalCo2SavedKg: Math.round(impact.totalCo2SavedKg * 10) / 10,
    totalItemsReused: impact.totalItemsReused,
  });
});

module.exports = { getImpactSummary, getUserImpact };
