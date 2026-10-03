// src/models/Review.model.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },
  },
  { timestamps: true }
);

// One review per order+reviewer
reviewSchema.index({ order: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1 });

// Update reviewee's rating aggregates after save
reviewSchema.post('save', async function () {
  const User = require('./User.model');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { reviewee: this.reviewee } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length) {
    await User.findByIdAndUpdate(this.reviewee, {
      ratingAvg: Math.round(stats[0].avg * 10) / 10,
      ratingCount: stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
