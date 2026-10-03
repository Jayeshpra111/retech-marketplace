// src/controllers/review.controller.js
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const Review = require('../models/Review.model');
const Order = require('../models/Order.model');
const AppError = require('../utils/AppError');

const createReview = asyncHandler(async (req, res) => {
  const { orderId, rating, comment } = req.body;
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found.', 404);
  if (order.orderStatus !== 'completed') throw new AppError('You can only review a completed order.', 400);
  if (order.buyer.toString() !== req.user._id.toString())
    throw new AppError('Only the buyer can leave a review.', 403);

  const review = await Review.create({
    order: orderId,
    reviewer: req.user._id,
    reviewee: order.seller,
    rating,
    comment,
  });

  apiResponse(res, 201, 'Review submitted.', review);
});

const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewee: req.params.id })
    .sort({ createdAt: -1 })
    .populate('reviewer', 'name avatar');
  apiResponse(res, 200, 'Reviews fetched.', reviews);
});

module.exports = { createReview, getUserReviews };
