// src/utils/cronJobs.js — Periodic maintenance jobs (auto-confirm, stale reservations, offer expiry)
const Order = require('../models/Order.model');
const Offer = require('../models/Offer.model');
const orderService = require('../services/order.service');
const logger = require('../config/logger');

const runAutoConfirmJob = async () => {
  try {
    const expiredOrders = await Order.find({
      orderStatus: 'delivered',
      autoConfirmAt: { $lte: new Date() },
    });

    for (const order of expiredOrders) {
      logger.info(`Auto-confirming delivered order: ${order._id}`);
      await orderService.transitionOrder(order._id, null, null, 'completed', { isSystem: true });
    }
  } catch (err) {
    logger.error({ err }, 'Error running auto-confirm job');
  }
};

const runStaleReservationCleanup = async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const staleOrders = await Order.find({
      orderStatus: 'pending',
      paymentMethod: 'online',
      paymentStatus: 'unpaid',
      createdAt: { $lte: thirtyMinutesAgo },
    });

    for (const order of staleOrders) {
      logger.info(`Cleaning up stale unpaid order: ${order._id}`);
      await orderService.transitionOrder(order._id, null, null, 'cancelled', { isSystem: true });
    }
  } catch (err) {
    logger.error({ err }, 'Error running stale reservation cleanup job');
  }
};

const runOfferExpiryJob = async () => {
  try {
    const result = await Offer.updateMany(
      { status: 'pending', expiresAt: { $lte: new Date() } },
      { status: 'expired' }
    );
    if (result.modifiedCount > 0) {
      logger.info(`Expired ${result.modifiedCount} pending offers`);
    }
  } catch (err) {
    logger.error({ err }, 'Error running offer expiry job');
  }
};

const startCronJobs = (intervalMs = 5 * 60 * 1000) => {
  logger.info('Starting automated background jobs (auto-confirm, stale orders, offer expiry)');
  // Run once on startup
  runAutoConfirmJob();
  runStaleReservationCleanup();
  runOfferExpiryJob();

  // Run on interval
  const timer = setInterval(() => {
    runAutoConfirmJob();
    runStaleReservationCleanup();
    runOfferExpiryJob();
  }, intervalMs);

  return timer;
};

module.exports = { startCronJobs, runAutoConfirmJob, runStaleReservationCleanup, runOfferExpiryJob };
