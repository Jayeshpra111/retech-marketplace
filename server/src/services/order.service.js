
 // src/services/order.service.js
const Order = require('../models/Order.model');
const Listing = require('../models/Listing.model');
const Offer = require('../models/Offer.model');
const AppError = require('../utils/AppError');
const { AUTO_CONFIRM_DAYS, PLATFORM_COMMISSION_PERCENT } = require('../config/env');

const ALLOWED_TRANSITIONS = {
  pending: {
    paid: ['system'],
    confirmed: ['seller', 'admin', 'system'],
    cancelled: ['buyer', 'seller', 'admin', 'system'],
  },
  paid: {
    confirmed: ['seller', 'admin'],
    cancelled: ['buyer', 'seller', 'admin'],
  },
  confirmed: {
    shipped: ['seller', 'admin'],
    cancelled: ['seller', 'admin'],
  },
  shipped: {
    delivered: ['buyer', 'admin', 'system'],
    disputed: ['buyer'],
  },
  delivered: {
    completed: ['buyer', 'admin', 'system'],
    disputed: ['buyer'],
  },
  disputed: {
    completed: ['admin'],
    refunded: ['admin'],
    cancelled: ['admin'],
  },
  completed: {},
  cancelled: {},
  refunded: {},
};

const createOrder = async (
  buyerId,
  { listingId, shippingAddress, paymentMethod, offerId }
) => {
  const listing = await Listing.findById(listingId).populate(
    'seller',
    'email name'
  );

  if (!listing) {
    throw new AppError('Listing not found.', 404);
  }

  if (listing.status !== 'active') {
    throw new AppError('This listing is no longer available.', 400);
  }

  if (listing.seller._id.toString() === buyerId.toString()) {
    throw new AppError('You cannot buy your own listing.', 400);
  }

  let finalPrice = listing.price;

  // Validate an accepted offer, if provided.
  if (offerId) {
    const offer = await Offer.findById(offerId);

    if (!offer) {
      throw new AppError('Offer not found.', 404);
    }

    if (offer.buyer.toString() !== buyerId.toString()) {
      throw new AppError('This offer does not belong to your account.', 403);
    }

    if (offer.listing.toString() !== listingId.toString()) {
      throw new AppError('Offer is not for this listing.', 400);
    }

    if (offer.status !== 'accepted') {
      throw new AppError(
        'Only accepted offers can be used during checkout.',
        400
      );
    }

    if (offer.expiresAt && new Date(offer.expiresAt) < new Date()) {
      throw new AppError('The accepted offer has expired.', 400);
    }

    finalPrice = offer.counterAmount || offer.amount;
  }

  // Reserve the listing atomically so two buyers cannot reserve it together.
  const updatedListing = await Listing.findOneAndUpdate(
    { _id: listingId, status: 'active' },
    { $set: { status: 'reserved' } },
    { returnDocument: 'after' }
  );

  if (!updatedListing) {
    throw new AppError(
      'Listing was just taken. Please try another.',
      409
    );
  }

  try {
    const commission =
      (finalPrice * PLATFORM_COMMISSION_PERCENT) / 100;

    const initialStatus =
      paymentMethod === 'cod' ? 'confirmed' : 'pending';

    const order = await Order.create({
      buyer: buyerId,
      seller: listing.seller._id,
      listing: listingId,
      priceAtPurchase: finalPrice,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'unpaid',
      commissionAmount: commission,
      impactKg: listing.impactKg || 0,
      co2SavedKg: listing.co2SavedKg || 0,
      orderStatus: initialStatus,
      statusHistory: [
        {
          status: initialStatus,
          at: new Date(),
        },
      ],
    });

    return order;
  } catch (error) {
    // Restore inventory if creating the order fails.
    await Listing.findOneAndUpdate(
      { _id: listingId, status: 'reserved' },
      { $set: { status: 'active' } }
    );

    throw error;
  }
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

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  const buyerId = order.buyer?._id || order.buyer;
  const sellerId = order.seller?._id || order.seller;

  const isParty =
    userId &&
    (
      buyerId.toString() === userId.toString() ||
      sellerId.toString() === userId.toString()
    );

  if (!isParty && role !== 'admin') {
    throw new AppError('Access denied.', 403);
  }

  return order;
};

// Change an order's status after validating its transition and permissions.
const transitionOrder = async (
  orderId,
  userId,
  role,
  newStatus,
  extraData = {}
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  const isBuyer =
    userId && order.buyer.toString() === userId.toString();

  const isSeller =
    userId && order.seller.toString() === userId.toString();

  const isAdmin = role === 'admin';
  const isSystem = extraData?.isSystem === true;

  const currentStatus = order.orderStatus;

  const allowedRolesForTransition =
    ALLOWED_TRANSITIONS[currentStatus]?.[newStatus];

  if (!allowedRolesForTransition) {
    throw new AppError(
      `Invalid order status transition from "${currentStatus}" to "${newStatus}".`,
      400
    );
  }

  // Restrict automatic cancellation to stale, unpaid online orders.
  if (isSystem && newStatus === 'cancelled') {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);

    const isEligibleForSystemCancellation =
      currentStatus === 'pending' &&
      order.paymentMethod === 'online' &&
      order.paymentStatus === 'unpaid' &&
      order.createdAt &&
      new Date(order.createdAt) <= cutoff;

    if (!isEligibleForSystemCancellation) {
      throw new AppError(
        'System cancellation is only allowed for stale, unpaid online orders.',
        403
      );
    }
  }

  const hasPermission =
    (isAdmin && allowedRolesForTransition.includes('admin')) ||
    (isSystem && allowedRolesForTransition.includes('system')) ||
    (isSeller && allowedRolesForTransition.includes('seller')) ||
    (isBuyer && allowedRolesForTransition.includes('buyer'));

  if (!hasPermission) {
    throw new AppError(
      `You do not have permission to transition order from "${currentStatus}" to "${newStatus}".`,
      403
    );
  }

  const updatePayload = {
    $set: { orderStatus: newStatus },
    $push: {
      statusHistory: {
        status: newStatus,
        at: new Date(),
      },
    },
  };

  if (newStatus === 'paid') {
    updatePayload.$set.paymentStatus = 'held';

    if (extraData.gatewayPaymentId) {
      updatePayload.$set.gatewayPaymentId =
        extraData.gatewayPaymentId;
    }

    if (extraData.gatewayOrderId) {
      updatePayload.$set.gatewayOrderId =
        extraData.gatewayOrderId;
    }
  }

  if (newStatus === 'shipped' && extraData.trackingInfo) {
    updatePayload.$set.trackingInfo = extraData.trackingInfo;
  }

  if (newStatus === 'delivered') {
    const autoConfirmAt = new Date();

    autoConfirmAt.setDate(
      autoConfirmAt.getDate() + AUTO_CONFIRM_DAYS
    );

    updatePayload.$set.autoConfirmAt = autoConfirmAt;
  }

  if (newStatus === 'completed') {
    updatePayload.$set.paymentStatus = 'released';
  }

  if (newStatus === 'cancelled' && order.paymentStatus === 'held') {
    updatePayload.$set.paymentStatus = 'refunded';
  }

  if (newStatus === 'refunded') {
    updatePayload.$set.paymentStatus = 'refunded';
  }

  // Update only if the order is still in the status we checked.
  const updatedOrder = await Order.findOneAndUpdate(
    { _id: orderId, orderStatus: currentStatus },
    updatePayload,
    { returnDocument: 'after', runValidators: true }
  );

  if (!updatedOrder) {
    throw new AppError(
      'Order state changed concurrently. Please refresh and try again.',
      409
    );
  }

  // Synchronize listing availability with the final order state.
  if (newStatus === 'completed') {
    await Listing.findByIdAndUpdate(order.listing, {
      $set: { status: 'sold' },
    });
  } else if (
    newStatus === 'cancelled' ||
    newStatus === 'refunded'
  ) {
    await Listing.findByIdAndUpdate(order.listing, {
      $set: { status: 'active' },
    });
  }

  return updatedOrder;
};

const deleteOrder = async (orderId, userId, role) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  const isBuyer = order.buyer.toString() === userId.toString();
  const isSeller = order.seller.toString() === userId.toString();
  const isAdmin = role === 'admin';

  if (!isBuyer && !isSeller && !isAdmin) {
    throw new AppError('Access denied.', 403);
  }

  if (['pending', 'cancelled'].includes(order.orderStatus)) {
    await Listing.findByIdAndUpdate(order.listing, {
      $set: { status: 'active' },
    });
  }

  await Order.findByIdAndDelete(orderId);

  return { success: true, id: orderId };
};

module.exports = {
  createOrder,
  getMyOrders,
  getSellingOrders,
  getOrderById,
  transitionOrder,
  deleteOrder,
};
