// src/controllers/dispute.controller.js
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const Dispute = require('../models/Dispute.model');
const Order = require('../models/Order.model');
const AppError = require('../utils/AppError');
const orderService = require('../services/order.service');

const openDispute = asyncHandler(async (req, res) => {
  const { orderId, reason, description } = req.body;
  if (!orderId || !reason) {
    throw new AppError('Order ID and reason are required to open a dispute.', 400);
  }

  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found.', 404);

  if (order.buyer.toString() !== req.user._id.toString()) {
    throw new AppError('Only the buyer can open a dispute on this order.', 403);
  }

  if (!['shipped', 'delivered'].includes(order.orderStatus)) {
    throw new AppError('Disputes can only be opened for shipped or delivered orders.', 400);
  }

  const existingDispute = await Dispute.findOne({ order: orderId, status: 'open' });
  if (existingDispute) {
    throw new AppError('A dispute is already active for this order.', 400);
  }

  const dispute = await Dispute.create({
    order: orderId,
    openedBy: req.user._id,
    reason,
    description: description || '',
    status: 'open',
  });

  // Transition order to disputed status
  await orderService.transitionOrder(orderId, req.user._id, req.user.role, 'disputed');
  await Order.findByIdAndUpdate(orderId, { disputeStatus: 'open' });

  apiResponse(res, 201, 'Dispute filed successfully.', dispute);
});

const getMyDisputes = asyncHandler(async (req, res) => {
  const disputes = await Dispute.find({ openedBy: req.user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: 'order',
      populate: [
        { path: 'listing', select: 'title images price' },
        { path: 'seller', select: 'name email avatar' },
      ],
    });

  apiResponse(res, 200, 'Your disputes fetched.', disputes);
});

const getDisputeById = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id)
    .populate('openedBy', 'name email avatar')
    .populate({
      path: 'order',
      populate: [
        { path: 'listing', select: 'title images price' },
        { path: 'buyer', select: 'name email phone' },
        { path: 'seller', select: 'name email phone' },
      ],
    });

  if (!dispute) throw new AppError('Dispute not found.', 404);

  const isBuyer = dispute.order.buyer._id.toString() === req.user._id.toString();
  const isSeller = dispute.order.seller._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isBuyer && !isSeller && !isAdmin) {
    throw new AppError('Access denied.', 403);
  }

  apiResponse(res, 200, 'Dispute fetched.', dispute);
});

const resolveDispute = asyncHandler(async (req, res) => {
  const { action, resolutionNote } = req.body; // 'refund' | 'release'
  if (!['refund', 'release'].includes(action)) {
    throw new AppError('Action must be either "refund" or "release".', 400);
  }

  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) throw new AppError('Dispute not found.', 404);
  if (dispute.status !== 'open') {
    throw new AppError('Dispute is already resolved.', 400);
  }

  if (action === 'refund') {
    dispute.status = 'resolved_refund';
    await orderService.transitionOrder(dispute.order, req.user._id, 'admin', 'refunded', { isSystem: true });
    await Order.findByIdAndUpdate(dispute.order, { disputeStatus: 'resolved_refund' });
  } else {
    dispute.status = 'resolved_release';
    await orderService.transitionOrder(dispute.order, req.user._id, 'admin', 'completed', { isSystem: true });
    await Order.findByIdAndUpdate(dispute.order, { disputeStatus: 'resolved_release' });
  }

  dispute.resolvedBy = req.user._id;
  dispute.resolutionNote = resolutionNote || '';
  await dispute.save();

  apiResponse(res, 200, `Dispute resolved with action: ${action}.`, dispute);
});

module.exports = { openDispute, getMyDisputes, getDisputeById, resolveDispute };
