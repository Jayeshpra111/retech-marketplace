// src/routes/listing.routes.js
const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listing.controller');
const { protect, optionalAuth } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const upload = require('../middlewares/upload.middleware');
const { uploadLimiter } = require('../middlewares/rateLimit.middleware');
const { createListingSchema, updateListingSchema, listingQuerySchema } = require('../validators/listing.validators');
const Category = require('../models/Category.model');
const apiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Public
router.get('/', validate(listingQuerySchema, { query: true }), listingController.getListings);
router.get('/categories', asyncHandler(async (req, res) => {
  const cats = await Category.find({ isActive: true }).sort({ name: 1 });
  apiResponse(res, 200, 'Categories fetched.', cats);
}));

// Authenticated
router.get('/my', protect, listingController.getMyListings);
router.get('/wishlist', protect, listingController.getWishlist);
router.post('/', protect, uploadLimiter, upload.array('images', 6), validate(createListingSchema), listingController.createListing);

// Single listing (public with optional auth)
router.get('/:id', optionalAuth, listingController.getListingById);
router.patch('/:id', protect, upload.array('images', 6), validate(updateListingSchema), listingController.updateListing);
router.delete('/:id', protect, listingController.deleteListing);
router.post('/:id/wishlist', protect, listingController.toggleWishlist);
router.delete('/:id/wishlist', protect, listingController.toggleWishlist);

module.exports = router;
