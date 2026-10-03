// src/models/RecyclingCenter.model.js
const mongoose = require('mongoose');

const recyclingCenterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: {
      line1: String,
      city: { type: String, required: true },
      state: String,
      pincode: String,
    },
    coords: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    acceptedItems: [String],
    certification: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

recyclingCenterSchema.index({ coords: '2dsphere' });
recyclingCenterSchema.index({ 'address.city': 1 });

module.exports = mongoose.model('RecyclingCenter', recyclingCenterSchema);
