// src/models/Payment.model.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    gateway: { type: String, enum: ['razorpay', 'stripe', 'cod'], required: true },
    gatewayOrderId: { type: String, default: '' },
    gatewayPaymentId: { type: String, default: '' },
    amount: { type: Number, required: true }, // in smallest currency unit (paise)
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['created', 'captured', 'failed', 'refunded'],
      default: 'created',
    },
    // Idempotency key — store webhook event ID to prevent duplicate processing
    rawEventId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

paymentSchema.index({ order: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
