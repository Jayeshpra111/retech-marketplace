// src/services/payment.service.js
const crypto = require('crypto');
const Order = require('../models/Order.model');
const Payment = require('../models/Payment.model');
const AppError = require('../utils/AppError');
const orderService = require('./order.service');
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET, NODE_ENV } = require('../config/env');

const createPaymentOrder = async (orderId, userId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found.', 404);
  if (order.buyer.toString() !== userId.toString()) throw new AppError('Access denied.', 403);
  if (order.orderStatus !== 'pending') throw new AppError('Order is not in pending status.', 400);

  const amountInPaise = Math.round(order.priceAtPurchase * 100);
  let gatewayOrderId = null;

  // Real Razorpay API integration
  if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET && !RAZORPAY_KEY_ID.startsWith('mock_')) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `order_${order._id.toString()}`,
          notes: {
            orderId: order._id.toString(),
            buyerId: userId.toString(),
          },
        }),
      });

      const rzpData = await response.json();
      if (!response.ok) {
        throw new Error(rzpData.error?.description || 'Razorpay order creation failed');
      }
      gatewayOrderId = rzpData.id;
    } catch (err) {
      throw new AppError(`Payment provider error: ${err.message}`, 502);
    }
  } else {
    // Only in local development mode without keys
    if (NODE_ENV === 'production') {
      throw new AppError('Razorpay payment gateway is not properly configured.', 500);
    }
    gatewayOrderId = `order_dev_${Date.now()}_${order._id.toString().slice(-6)}`;
  }

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
  } else {
    payment.gatewayOrderId = gatewayOrderId;
    payment.amount = amountInPaise;
    await payment.save();
  }

  order.gatewayOrderId = payment.gatewayOrderId;
  await order.save();

  return {
    orderId: order._id,
    gatewayOrderId: payment.gatewayOrderId,
    amount: payment.amount,
    currency: payment.currency,
    keyId: RAZORPAY_KEY_ID || '',
  };
};

const verifyPayment = async (orderId, userId, { gatewayPaymentId, gatewayOrderId, signature }) => {
  if (!gatewayPaymentId || !gatewayOrderId) {
    throw new AppError('gatewayPaymentId and gatewayOrderId are required.', 400);
  }

  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found.', 404);
  if (order.buyer.toString() !== userId.toString()) throw new AppError('Access denied.', 403);

  // Require and strictly verify HMAC signature
  if (NODE_ENV === 'production' && !RAZORPAY_KEY_SECRET) {
    throw new AppError('Payment gateway secret is not configured on the server.', 500);
  }

  if (RAZORPAY_KEY_SECRET && !RAZORPAY_KEY_SECRET.startsWith('mock_')) {
    if (!signature) {
      throw new AppError('Payment signature is missing and required for verification.', 400);
    }
    const expected = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${gatewayOrderId}|${gatewayPaymentId}`)
      .digest('hex');

    if (expected !== signature) {
      throw new AppError('Invalid payment signature. Verification failed.', 400);
    }
  } else if (NODE_ENV === 'production') {
    throw new AppError('Production requires valid payment secret.', 500);
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
  if (!signature) {
    throw new AppError('Missing webhook signature.', 400);
  }

  if (RAZORPAY_WEBHOOK_SECRET && !RAZORPAY_WEBHOOK_SECRET.startsWith('mock_')) {
    const expected = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');
    if (expected !== signature) {
      throw new AppError('Invalid webhook signature.', 400);
    }
  } else if (NODE_ENV === 'production') {
    throw new AppError('Webhook secret is not configured.', 500);
  }

  let event;
  try {
    event = typeof rawBody === 'string' ? JSON.parse(rawBody) : JSON.parse(rawBody.toString());
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
