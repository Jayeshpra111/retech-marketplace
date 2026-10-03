// src/models/Dispute.model.js
const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    openedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true, maxlength: 500 },
    description: { type: String, maxlength: 2000 },
    evidence: [{ url: String, publicId: String }],
    status: {
      type: String,
      enum: ['open', 'resolved_refund', 'resolved_release'],
      default: 'open',
    },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resolutionNote: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dispute', disputeSchema);
