// src/controllers/recycler.controller.js
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const RecyclingCenter = require('../models/RecyclingCenter.model');
const AppError = require('../utils/AppError');

const getCenters = asyncHandler(async (req, res) => {
  const { city } = req.query;
  const filter = { isActive: true };
  if (city) filter['address.city'] = { $regex: city, $options: 'i' };
  const centers = await RecyclingCenter.find(filter).sort({ name: 1 }).limit(50);
  apiResponse(res, 200, 'Recycling centers fetched.', centers);
});

const createCenter = asyncHandler(async (req, res) => {
  const center = await RecyclingCenter.create(req.body);
  apiResponse(res, 201, 'Recycling center created.', center);
});

const updateCenter = asyncHandler(async (req, res) => {
  const center = await RecyclingCenter.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!center) throw new AppError('Recycling center not found.', 404);
  apiResponse(res, 200, 'Recycling center updated.', center);
});

const deleteCenter = asyncHandler(async (req, res) => {
  await RecyclingCenter.findByIdAndDelete(req.params.id);
  apiResponse(res, 200, 'Recycling center deleted.');
});

module.exports = { getCenters, createCenter, updateCenter, deleteCenter };
