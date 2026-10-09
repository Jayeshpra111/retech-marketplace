// src/routes/dispute.routes.js
const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/dispute.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

router.post('/', protect, disputeController.openDispute);
router.get('/my', protect, disputeController.getMyDisputes);
router.get('/:id', protect, disputeController.getDisputeById);
router.patch('/:id/resolve', protect, adminOnly, disputeController.resolveDispute);

module.exports = router;
