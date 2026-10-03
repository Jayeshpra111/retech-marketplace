// src/controllers/offer.controller.js
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const Offer = require('../models/Offer.model');
const Listing = require('../models/Listing.model');
const AppError = require('../utils/AppError');

const createOffer = asyncHandler(async (req, res) => {
  const { listingId, amount } = req.body;
  if (!amount || amount <= 0) throw new AppError('Valid offer amount is required.', 400);

  const listing = await Listing.findById(listingId);
  if (!listing) throw new AppError('Listing not found.', 404);
  if (listing.status !== 'active') throw new AppError('Listing is no longer active.', 400);
  if (listing.seller.toString() === req.user._id.toString()) {
    throw new AppError('Cannot make an offer on your own listing.', 400);
  }

  // Set 48h expiration
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48);

  const offer = await Offer.create({
    listing: listingId,
    buyer: req.user._id,
    amount,
    expiresAt,
    status: 'pending',
  });

  await offer.populate('buyer', 'name avatar ratingAvg');
  await offer.populate('listing', 'title price images slug');

  // Notify seller via socket if online
  const io = req.app.get('io');
  if (io) {
    io.to(`user:${listing.seller.toString()}`).emit('newOffer', offer);
  }

  apiResponse(res, 201, 'Offer submitted.', offer);
});

const getMyOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find({ buyer: req.user._id })
    .sort({ createdAt: -1 })
    .populate('listing', 'title price images slug status');
  apiResponse(res, 200, 'Your offers fetched.', offers);
});

const getListingOffers = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.listingId);
  if (!listing) throw new AppError('Listing not found.', 404);

  const isSeller = listing.seller.toString() === req.user._id.toString();
  const filter = isSeller
    ? { listing: listing._id }
    : { listing: listing._id, buyer: req.user._id };

  const offers = await Offer.find(filter)
    .sort({ createdAt: -1 })
    .populate('buyer', 'name avatar ratingAvg');

  apiResponse(res, 200, 'Offers fetched.', offers);
});

const respondOffer = asyncHandler(async (req, res) => {
  const { action, counterAmount } = req.body; // 'accepted', 'rejected', 'countered'
  if (!['accepted', 'rejected', 'countered'].includes(action)) {
    throw new AppError('Action must be accepted, rejected, or countered.', 400);
  }

  const offer = await Offer.findById(req.params.id).populate('listing');
  if (!offer) throw new AppError('Offer not found.', 404);

  const isSeller = offer.listing.seller.toString() === req.user._id.toString();
  const isBuyer = offer.buyer.toString() === req.user._id.toString();

  if (action === 'countered') {
    if (!isSeller) throw new AppError('Only the seller can counter an offer.', 403);
    if (!counterAmount || counterAmount <= 0) {
      throw new AppError('Please provide a valid counterAmount.', 400);
    }
    offer.status = 'countered';
    offer.counterAmount = counterAmount;
  } else if (action === 'accepted') {
    if (!isSeller && !isBuyer) throw new AppError('Access denied.', 403);
    offer.status = 'accepted';
  } else if (action === 'rejected') {
    if (!isSeller && !isBuyer) throw new AppError('Access denied.', 403);
    offer.status = 'rejected';
  }

  await offer.save();

  // Notify buyer and seller
  const io = req.app.get('io');
  if (io) {
    io.to(`user:${offer.buyer.toString()}`).emit('offerUpdated', offer);
    io.to(`user:${offer.listing.seller.toString()}`).emit('offerUpdated', offer);
  }

  apiResponse(res, 200, `Offer ${action}.`, offer);
});

module.exports = { createOffer, getMyOffers, getListingOffers, respondOffer };
