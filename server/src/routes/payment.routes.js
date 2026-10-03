// src/routes/payment.routes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/create', protect, paymentController.createPayment);
router.post('/verify', protect, paymentController.verifyPayment);
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
