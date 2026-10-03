// src/routes/offer.routes.js
const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offer.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/', protect, offerController.createOffer);
router.get('/my', protect, offerController.getMyOffers);
router.get('/listing/:listingId', protect, offerController.getListingOffers);
router.patch('/:id/respond', protect, offerController.respondOffer);

module.exports = router;
