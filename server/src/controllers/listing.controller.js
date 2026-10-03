// src/controllers/listing.controller.js
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const listingService = require('../services/listing.service');

const createListing = asyncHandler(async (req, res) => {
  const listing = await listingService.createListing(req.user._id, req.body, req.files || []);
  apiResponse(res, 201, 'Listing submitted for review.', listing);
});

const getListings = asyncHandler(async (req, res) => {
  const result = await listingService.getListings(req.validatedQuery || req.query);
  const { listings, total, page, limit, pages } = result;
  apiResponse(res, 200, 'Listings fetched.', listings, { total, page, limit, pages });
});

const getListingById = asyncHandler(async (req, res) => {
  const listing = await listingService.getListingById(req.params.id);
  apiResponse(res, 200, 'Listing fetched.', listing);
});

const updateListing = asyncHandler(async (req, res) => {
  const listing = await listingService.updateListing(req.params.id, req.user._id, req.body, req.files || []);
  apiResponse(res, 200, 'Listing updated.', listing);
});

const deleteListing = asyncHandler(async (req, res) => {
  await listingService.deleteListing(req.params.id, req.user._id, req.user.role);
  apiResponse(res, 200, 'Listing deleted.');
});

const toggleWishlist = asyncHandler(async (req, res) => {
  const result = await listingService.toggleWishlist(req.user._id, req.params.id);
  apiResponse(res, 200, result.added ? 'Added to wishlist.' : 'Removed from wishlist.', result);
});

const getMyListings = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const result = await listingService.getMyListings(req.user._id, page, limit);
  apiResponse(res, 200, 'Your listings fetched.', result.listings, {
    total: result.total, page: result.page, limit: result.limit,
  });
});

const getWishlist = asyncHandler(async (req, res) => {
  const Wishlist = require('../models/Wishlist.model');
  const wl = await Wishlist.findOne({ user: req.user._id }).populate({
    path: 'listings',
    populate: [{ path: 'seller', select: 'name avatar' }, { path: 'category', select: 'name slug' }],
  });
  apiResponse(res, 200, 'Wishlist fetched.', wl ? wl.listings : []);
});

module.exports = {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  toggleWishlist,
  getMyListings,
  getWishlist,
};
