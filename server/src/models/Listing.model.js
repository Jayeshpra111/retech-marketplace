// src/models/Listing.model.js
const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const imageSchema = new mongoose.Schema(
  { url: String, publicId: String },
  { _id: false }
);

const listingSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true, maxlength: 3000 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, trim: true, default: '' },
    model: { type: String, trim: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    negotiable: { type: Boolean, default: false },
    condition: {
      type: String,
      enum: ['like_new', 'good', 'fair', 'needs_repair', 'for_parts'],
      required: true,
    },
    ageInMonths: { type: Number, default: null },
    warrantyLeftMonths: { type: Number, default: 0 },
    hasBill: { type: Boolean, default: false },
    accessories: [{ type: String }],
    // Category-specific technical specs (validated by Zod per category)
    specs: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    serialNumber: { type: String, select: false, default: '' },
    images: { type: [imageSchema], validate: { validator: (a) => a.length <= 6 } },
    location: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      coords: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
      },
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'active', 'reserved', 'sold', 'rejected', 'removed'],
      default: 'pending',
    },
    rejectionReason: { type: String, default: '' },
    views: { type: Number, default: 0 },
    // Environmental impact (calculated server-side)
    impactKg: { type: Number, default: 0 },
    co2SavedKg: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
listingSchema.index({ title: 'text', brand: 'text', model: 'text', description: 'text' });
listingSchema.index({ status: 1, category: 1, price: 1 });
listingSchema.index({ 'location.coords': '2dsphere' });
listingSchema.index({ seller: 1, status: 1 });

// ── Slug ──────────────────────────────────────────────────────────────────────
listingSchema.pre('save', function () {
  if (this.isNew || this.isModified('title')) {
    this.slug = slugify(this.title) + '-' + this._id.toString().slice(-6);
  }
});

module.exports = mongoose.model('Listing', listingSchema);
