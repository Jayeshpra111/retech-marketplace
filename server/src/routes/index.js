// src/routes/index.js — mounts all routers under /api/v1
const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/listings', require('./listing.routes'));
router.use('/orders', require('./order.routes'));
router.use('/payments', require('./payment.routes'));
router.use('/chat', require('./chat.routes'));
router.use('/offers', require('./offer.routes'));
router.use('/reviews', require('./review.routes'));
router.use('/reports', require('./report.routes'));
router.use('/impact', require('./impact.routes'));
router.use('/recycling-centers', require('./recycler.routes'));
router.use('/disputes', require('./dispute.routes'));
router.use('/admin', require('./admin.routes'));

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy', timestamp: new Date().toISOString() });
});

module.exports = router;
