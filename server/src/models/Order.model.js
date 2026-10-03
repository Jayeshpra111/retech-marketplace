// src/models/Order.model.js
const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  { status: String, at: { type: Date, default: Date.now } },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    priceAtPurchase: { type: Number, required: true },
    shippingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },
    paymentMethod: { type: String, enum: ['online', 'cod'], required: true },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'held', 'released', 'refunded'],
      default: 'unpaid',
    },
    gatewayOrderId: { type: String, default: '' },
    gatewayPaymentId: { type: String, default: '' },
    commissionAmount: { type: Number, default: 0 },
    // When the system will auto-confirm delivery
    autoConfirmAt: { type: Date },
    orderStatus: {
      type: String,
      enum: ['pending', 'paid', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'disputed'],
      default: 'pending',
    },
    disputeStatus: {
      type: String,
      enum: ['none', 'open', 'resolved_refund', 'resolved_release'],
      default: 'none',
    },
    trackingInfo: { carrier: String, trackingNumber: String },
    impactKg: { type: Number, default: 0 },
    co2SavedKg: { type: Number, default: 0 },
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
);

orderSchema.index({ buyer: 1, orderStatus: 1 });
orderSchema.index({ seller: 1, orderStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
