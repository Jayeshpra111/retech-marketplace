// src/models/Offer.model.js
const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'countered', 'expired'],
      default: 'pending',
    },
    counterAmount: { type: Number, default: null },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

offerSchema.index({ listing: 1, buyer: 1 });

module.exports = mongoose.model('Offer', offerSchema);
