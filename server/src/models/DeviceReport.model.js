// server/src/models/DeviceReport.model.js
const mongoose = require('mongoose');

const deviceReportSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing reference is required.'],
      unique: true, // One report per listing
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller reference is required.'],
      index: true,
    },
    deviceType: {
      type: String,
      enum: ['phone', 'laptop', 'tablet', 'gpu', 'desktop', 'component', 'other'],
      default: 'other',
    },
    battery: {
      healthPercent: { type: Number, min: 0, max: 100, default: null },
      cycleCount: { type: Number, min: 0, default: null },
      chargesProperly: { type: Boolean, default: true },
    },
    screen: {
      deadPixels: { type: Boolean, default: false },
      burnIn: { type: Boolean, default: false },
      touchWorks: { type: Boolean, default: true },
      scratches: {
        type: String,
        enum: ['none', 'micro', 'visible', 'cracked'],
        default: 'none',
      },
    },
    ports: [
      {
        name: { type: String, required: true },
        works: { type: Boolean, default: true },
      },
    ],
    storage: {
      sizeGB: { type: Number, min: 0, default: null },
      smartStatus: {
        type: String,
        enum: ['healthy', 'warning', 'failing', 'untested'],
        default: 'healthy',
      },
    },
    camera: { type: Boolean, default: true },
    speakers: { type: Boolean, default: true },
    wifiBluetooth: { type: Boolean, default: true },
    notes: { type: String, maxlength: 1000, default: '' },
    evidence: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
        caption: { type: String, default: '' },
      },
    ],
    healthScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
      default: 100,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DeviceReport', deviceReportSchema);
