// src/controllers/payment.controller.js
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const paymentService = require('../services/payment.service');

const createPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const paymentData = await paymentService.createPaymentOrder(orderId, req.user._id);
  apiResponse(res, 201, 'Payment order created.', paymentData);
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, gatewayPaymentId, gatewayOrderId, signature } = req.body;
  const result = await paymentService.verifyPayment(orderId, req.user._id, {
    gatewayPaymentId,
    gatewayOrderId,
    signature,
  });
  apiResponse(res, 200, 'Payment verified and held in escrow.', result);
});

const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.body;
  const result = await paymentService.handleWebhook(rawBody, signature);
  res.status(200).json({ success: true, ...result });
});

module.exports = { createPayment, verifyPayment, handleWebhook };
