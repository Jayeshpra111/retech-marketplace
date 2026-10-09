// src/controllers/order.controller.js
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const orderService = require('../services/order.service');

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user._id, req.body);
  apiResponse(res, 201, 'Order created.', order);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const result = await orderService.getMyOrders(req.user._id, page, limit);
  apiResponse(res, 200, 'Orders fetched.', result.orders, { total: result.total, page, limit });
});

const getSellingOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const result = await orderService.getSellingOrders(req.user._id, page, limit);
  apiResponse(res, 200, 'Selling orders fetched.', result.orders, { total: result.total, page, limit });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user._id, req.user.role);
  apiResponse(res, 200, 'Order fetched.', order);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingInfo } = req.body;
  const order = await orderService.transitionOrder(req.params.id, req.user._id, req.user.role, status, { trackingInfo });
  apiResponse(res, 200, `Order status updated to ${status}.`, order);
});

const confirmDelivery = asyncHandler(async (req, res) => {
  const order = await orderService.transitionOrder(req.params.id, req.user._id, req.user.role, 'delivered');
  apiResponse(res, 200, 'Delivery confirmed.', order);
});

const deleteOrder = asyncHandler(async (req, res) => {
  const result = await orderService.deleteOrder(req.params.id, req.user._id, req.user.role);
  apiResponse(res, 200, 'Order discarded successfully.', result);
});

module.exports = { createOrder, getMyOrders, getSellingOrders, getOrderById, updateOrderStatus, confirmDelivery, deleteOrder };

