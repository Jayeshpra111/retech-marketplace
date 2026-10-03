// src/routes/recycler.routes.js
const express = require('express');
const router = express.Router();
const recyclerController = require('../controllers/recycler.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

router.get('/', recyclerController.getCenters); // public

// Admin only
router.post('/', protect, restrictTo('admin'), recyclerController.createCenter);
router.patch('/:id', protect, restrictTo('admin'), recyclerController.updateCenter);
router.delete('/:id', protect, restrictTo('admin'), recyclerController.deleteCenter);

module.exports = router;
