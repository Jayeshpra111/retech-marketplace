// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

// All admin routes require auth + admin role
router.use(protect, restrictTo('admin'));

router.get('/stats', adminController.getStats);

router.get('/listings', adminController.getPendingListings);
router.patch('/listings/:id/approve', adminController.approveListing);
router.patch('/listings/:id/reject', adminController.rejectListing);

router.get('/users', adminController.getUsers);
router.patch('/users/:id/ban', adminController.banUser);

router.get('/reports', adminController.getReports);
router.patch('/reports/:id', adminController.resolveReport);

router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.patch('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

module.exports = router;
