// src/models/Category.model.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    icon: { type: String, default: '' }, // lucide icon name or SVG path
    isComponent: { type: Boolean, default: false },
    // Weight in kg used for impact calculation
    impactWeightKg: { type: Number, default: 0.5 },
    co2Factor: { type: Number, default: 74 }, // kg CO2 saved per kg of e-waste diverted
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const slugify = require('../utils/slugify');

categorySchema.pre('save', function () {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
});

module.exports = mongoose.model('Category', categorySchema);
