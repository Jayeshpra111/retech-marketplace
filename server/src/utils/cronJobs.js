
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
      try {
        logger.info(`Auto-confirming delivered order: ${order._id}`);

        await orderService.transitionOrder(
          order._id,
          null,
          null,
          'completed',
          { isSystem: true }
        );
      } catch (err) {
        logger.error(
          { err, orderId: order._id },
          'Failed to auto-confirm delivered order'
        );
      }
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
      try {
        logger.info(`Cleaning up stale unpaid order: ${order._id}`);

        await orderService.transitionOrder(
          order._id,
          null,
          null,
          'cancelled',
          { isSystem: true }
        );

        logger.info(`Successfully cancelled stale order: ${order._id}`);
      } catch (err) {
        logger.error(
          { err, orderId: order._id },
          'Failed to cancel stale unpaid order'
        );
      }
    }
  } catch (err) {
    logger.error({ err }, 'Error running stale reservation cleanup job');
  }
};

const runOfferExpiryJob = async () => {
  try {
    const result = await Offer.updateMany(
      {
        status: 'pending',
        expiresAt: { $lte: new Date() },
      },
      {
        $set: { status: 'expired' },
      }
    );

    if (result.modifiedCount > 0) {
      logger.info(`Expired ${result.modifiedCount} pending offers`);
    }
  } catch (err) {
    logger.error({ err }, 'Error running offer expiry job');
  }
};

const startCronJobs = (intervalMs = 5 * 60 * 1000) => {
  logger.info(
    'Starting automated background jobs (auto-confirm, stale orders, offer expiry)'
  );

  // Prevent overlapping executions of each individual job.
  let autoConfirmRunning = false;
  let staleCleanupRunning = false;
  let offerExpiryRunning = false;

  const runSafely = async (job, isRunning, setRunning, jobName) => {
    if (isRunning()) {
      logger.warn(`${jobName} skipped because the previous run is still active`);
      return;
    }

    setRunning(true);

    try {
      await job();
    } catch (err) {
      logger.error({ err }, `${jobName} failed unexpectedly`);
    } finally {
      setRunning(false);
    }
  };

  const runAutoConfirmSafely = () =>
    runSafely(
      runAutoConfirmJob,
      () => autoConfirmRunning,
      (value) => { autoConfirmRunning = value; },
      'Auto-confirm job'
    );

  const runStaleCleanupSafely = () =>
    runSafely(
      runStaleReservationCleanup,
      () => staleCleanupRunning,
      (value) => { staleCleanupRunning = value; },
      'Stale-order cleanup job'
    );

  const runOfferExpirySafely = () =>
    runSafely(
      runOfferExpiryJob,
      () => offerExpiryRunning,
      (value) => { offerExpiryRunning = value; },
      'Offer-expiry job'
    );

  // Run once at startup.
  void runAutoConfirmSafely();
  void runStaleCleanupSafely();
  void runOfferExpirySafely();

  // Run periodically.
  const timer = setInterval(() => {
    void runAutoConfirmSafely();
    void runStaleCleanupSafely();
    void runOfferExpirySafely();
  }, intervalMs);

  return timer;
};

module.exports = {
  startCronJobs,
  runAutoConfirmJob,
  runStaleReservationCleanup,
  runOfferExpiryJob,
};
