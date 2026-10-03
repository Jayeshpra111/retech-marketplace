// src/services/order.service.js
const Order = require('../models/Order.model');
const Listing = require('../models/Listing.model');
const AppError = require('../utils/AppError');
const { sendOrderEmail } = require('../utils/sendEmail');
const { AUTO_CONFIRM_DAYS, PLATFORM_COMMISSION_PERCENT } = require('../config/env');

const createOrder = async (buyerId, { listingId, shippingAddress, paymentMethod }) => {
  const listing = await Listing.findById(listingId).populate('seller', 'email name');
  if (!listing) throw new AppError('Listing not found.', 404);
  if (listing.status !== 'active') throw new AppError('This listing is no longer available.', 400);
  if (listing.seller._id.toString() === buyerId.toString())
    throw new AppError('You cannot buy your own listing.', 400);

  // Reserve listing atomically
  const updated = await Listing.findOneAndUpdate(
    { _id: listingId, status: 'active' },
    { status: 'reserved' },
    { new: true }
  );
  if (!updated) throw new AppError('Listing was just taken. Please try another.', 409);

  const commission = (listing.price * PLATFORM_COMMISSION_PERCENT) / 100;
  const initialStatus = paymentMethod === 'cod' ? 'confirmed' : 'pending';

  const order = await Order.create({
    buyer: buyerId,
    seller: listing.seller._id,
    listing: listingId,
    priceAtPurchase: listing.price,
    shippingAddress,
    paymentMethod,
    paymentStatus: 'unpaid',
    commissionAmount: commission,
    impactKg: listing.impactKg || 0,
    co2SavedKg: listing.co2SavedKg || 0,
    orderStatus: initialStatus,
    statusHistory: [{ status: initialStatus }],
  });

  return order;
};

const getMyOrders = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find({ buyer: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('listing', 'title images price slug')
      .populate('seller', 'name avatar'),
    Order.countDocuments({ buyer: userId }),
  ]);
  return { orders, total, page, limit };
};

const getSellingOrders = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find({ seller: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('listing', 'title images price slug')
      .populate('buyer', 'name avatar'),
    Order.countDocuments({ seller: userId }),
  ]);
  return { orders, total, page, limit };
};

const getOrderById = async (orderId, userId, role) => {
  const order = await Order.findById(orderId)
    .populate('listing', 'title images price slug description')
    .populate('buyer', 'name avatar email phone sharePhone')
    .populate('seller', 'name avatar email phone sharePhone');
  if (!order) throw new AppError('Order not found.', 404);

  const isParty =
    userId &&
    (order.buyer._id.toString() === userId.toString() ||
      order.seller._id.toString() === userId.toString());
  if (!isParty && role !== 'admin') throw new AppError('Access denied.', 403);

  return order;
};

// Generic status transition helper
const transitionOrder = async (orderId, userId, role, newStatus, extraData = {}) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found.', 404);

  const isBuyer = userId && order.buyer.toString() === userId.toString();
  const isSeller = userId && order.seller.toString() === userId.toString();
  const isAdmin = role === 'admin';
  const isSystem = extraData && extraData.isSystem === true;

  const allowed = {
    paid: isBuyer || isAdmin || isSystem,
    confirmed: isSeller || isAdmin || isSystem,
    shipped: isSeller || isAdmin,
    delivered: isBuyer || isAdmin || isSystem,
    completed: isBuyer || isAdmin || isSystem,
    cancelled: isBuyer || isSeller || isAdmin || isSystem,
    refunded: isAdmin || isSystem,
    disputed: isBuyer,
  };

  if (!allowed[newStatus]) throw new AppError('You cannot perform this status change.', 403);

  order.orderStatus = newStatus;
  order.statusHistory.push({ status: newStatus });

  if (newStatus === 'paid') {
    order.paymentStatus = 'held';
    if (extraData.gatewayPaymentId) order.gatewayPaymentId = extraData.gatewayPaymentId;
    if (extraData.gatewayOrderId) order.gatewayOrderId = extraData.gatewayOrderId;
  }
  if (newStatus === 'shipped' && extraData.trackingInfo) {
    order.trackingInfo = extraData.trackingInfo;
  }
  if (newStatus === 'delivered') {
    const autoAt = new Date();
    autoAt.setDate(autoAt.getDate() + AUTO_CONFIRM_DAYS);
    order.autoConfirmAt = autoAt;
  }
  if (newStatus === 'completed') {
    order.paymentStatus = 'released';
    await Listing.findByIdAndUpdate(order.listing, { status: 'sold' });
  }
  if (newStatus === 'cancelled') {
    if (order.paymentStatus === 'unpaid') {
      await Listing.findByIdAndUpdate(order.listing, { status: 'active' });
    } else if (order.paymentStatus === 'held') {
      order.paymentStatus = 'refunded';
      await Listing.findByIdAndUpdate(order.listing, { status: 'active' });
    }
  }
  if (newStatus === 'refunded') {
    order.paymentStatus = 'refunded';
    await Listing.findByIdAndUpdate(order.listing, { status: 'active' });
  }

  await order.save();
  return order;
};

module.exports = { createOrder, getMyOrders, getSellingOrders, getOrderById, transitionOrder };
