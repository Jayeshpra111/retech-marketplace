// src/routes/order.routes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/', protect, orderController.createOrder);
router.get('/my', protect, orderController.getMyOrders);
router.get('/selling', protect, orderController.getSellingOrders);
router.get('/:id', protect, orderController.getOrderById);
router.patch('/:id/status', protect, orderController.updateOrderStatus);
router.post('/:id/confirm-delivery', protect, orderController.confirmDelivery);
router.delete('/:id', protect, orderController.deleteOrder);

module.exports = router;

