// src/services/payment.service.js
const crypto = require('crypto');
const Order = require('../models/Order.model');
const Payment = require('../models/Payment.model');
const AppError = require('../utils/AppError');
const orderService = require('./order.service');
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET } = require('../config/env');

const createPaymentOrder = async (orderId, userId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found.', 404);
  if (order.buyer.toString() !== userId.toString()) throw new AppError('Access denied.', 403);
  if (order.orderStatus !== 'pending') throw new AppError('Order is not in pending status.', 400);

  const amountInPaise = Math.round(order.priceAtPurchase * 100);
  const gatewayOrderId = `order_${Date.now()}_${order._id.toString().slice(-6)}`;

  let payment = await Payment.findOne({ order: order._id, status: 'created' });
  if (!payment) {
    payment = await Payment.create({
      order: order._id,
      gateway: 'razorpay',
      gatewayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      status: 'created',
    });
  }

  order.gatewayOrderId = payment.gatewayOrderId;
  await order.save();

  return {
    orderId: order._id,
    gatewayOrderId: payment.gatewayOrderId,
    amount: payment.amount,
    currency: payment.currency,
    keyId: RAZORPAY_KEY_ID || 'rzp_test_mock',
  };
};

const verifyPayment = async (orderId, userId, { gatewayPaymentId, gatewayOrderId, signature }) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found.', 404);
  if (order.buyer.toString() !== userId.toString()) throw new AppError('Access denied.', 403);

  // If secret configured, verify HMAC signature
  if (RAZORPAY_KEY_SECRET && signature && !RAZORPAY_KEY_SECRET.startsWith('mock_')) {
    const expected = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${gatewayOrderId}|${gatewayPaymentId}`)
      .digest('hex');
    if (expected !== signature) {
      throw new AppError('Invalid payment signature.', 400);
    }
  }

  const payment = await Payment.findOne({ order: order._id });
  if (payment) {
    payment.gatewayPaymentId = gatewayPaymentId;
    payment.status = 'captured';
    await payment.save();
  }

  const updatedOrder = await orderService.transitionOrder(
    order._id,
    userId,
    null,
    'paid',
    { isSystem: true, gatewayPaymentId, gatewayOrderId }
  );

  return { order: updatedOrder, paymentStatus: 'held' };
};

const handleWebhook = async (rawBody, signature) => {
  if (RAZORPAY_WEBHOOK_SECRET && signature && !RAZORPAY_WEBHOOK_SECRET.startsWith('mock_')) {
    const expected = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');
    if (expected !== signature) {
      throw new AppError('Invalid webhook signature.', 400);
    }
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString());
  } catch {
    throw new AppError('Invalid JSON in webhook payload.', 400);
  }

  const eventId = event.event_id || event.id;
  if (eventId) {
    const existing = await Payment.findOne({ rawEventId: eventId });
    if (existing) {
      return { received: true, duplicate: true };
    }
  }

  if (event.event === 'payment.captured' || event.event === 'order.paid') {
    const paymentEntity = event.payload?.payment?.entity || {};
    const gatewayOrderId = paymentEntity.order_id;
    const gatewayPaymentId = paymentEntity.id;

    if (gatewayOrderId) {
      const order = await Order.findOne({ gatewayOrderId });
      if (order && order.orderStatus === 'pending') {
        await orderService.transitionOrder(order._id, null, null, 'paid', {
          isSystem: true,
          gatewayPaymentId,
          gatewayOrderId,
        });

        await Payment.findOneAndUpdate(
          { gatewayOrderId },
          {
            status: 'captured',
            gatewayPaymentId,
            rawEventId: eventId,
          }
        );
      }
    }
  }

  return { received: true };
};

module.exports = { createPaymentOrder, verifyPayment, handleWebhook };
