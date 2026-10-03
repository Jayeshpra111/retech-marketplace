// src/services/listing.service.js
const mongoose = require('mongoose');
const Listing = require('../models/Listing.model');
const Category = require('../models/Category.model');
const Wishlist = require('../models/Wishlist.model');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');

// ── Upload images to Cloudinary ───────────────────────────────────────────────
const uploadToCloudinary = (buffer, folder = 'listings') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ width: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

const deleteFromCloudinary = (publicId) =>
  cloudinary.uploader.destroy(publicId);

// ── Create listing ────────────────────────────────────────────────────────────
const createListing = async (sellerId, data, files = []) => {
  let category;
  if (mongoose.Types.ObjectId.isValid(data.category)) {
    category = await Category.findById(data.category);
  }
  if (!category) {
    category = await Category.findOne({ slug: String(data.category).toLowerCase() });
  }
  if (!category) throw new AppError('Category not found.', 404);

  // Upload images if files provided, or format existing image URLs
  let images = [];
  if (files && files.length > 0) {
    images = await Promise.all(
      files.map(async (f) => {
        const result = await uploadToCloudinary(f.buffer);
        return { url: result.secure_url, publicId: result.public_id };
      })
    );
  } else if (Array.isArray(data.images) && data.images.length > 0) {
    images = data.images.map((img) =>
      typeof img === 'string' ? { url: img, publicId: '' } : img
    );
  }

  // Calculate impact
  const impactKg = category.impactWeightKg || 1;
  const co2SavedKg = impactKg * (category.co2Factor || 74);

  const listing = await Listing.create({
    ...data,
    category: category._id,
    seller: sellerId,
    images,
    impactKg,
    co2SavedKg,
    status: 'active', // default to active for immediate accessibility (or pending if review required)
  });

  return listing;
};

// ── Get listings (browse) ─────────────────────────────────────────────────────
const getListings = async (query) => {
  const { q, category, brand, minPrice, maxPrice, condition, city, sort, page, limit } = query;

  const filter = { status: 'active' };

  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;
  if (brand) filter.brand = { $regex: brand, $options: 'i' };
  if (condition) filter.condition = condition;
  if (city) filter['location.city'] = { $regex: city, $options: 'i' };
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  const sortMap = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    popular: { views: -1 },
  };
  const selectedSort = sortMap[sort] || { createdAt: -1 };
  const sortObj = q ? { score: { $meta: 'textScore' }, ...selectedSort } : selectedSort;

  const skip = (page - 1) * limit;
  const [listings, total] = await Promise.all([
    Listing.find(filter, q ? { score: { $meta: 'textScore' } } : {})
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate('seller', 'name avatar ratingAvg ratingCount isEmailVerified')
      .populate('category', 'name slug'),
    Listing.countDocuments(filter),
  ]);

  return { listings, total, page, limit, pages: Math.ceil(total / limit) };
};

// ── Get single listing ────────────────────────────────────────────────────────
const getListingById = async (id) => {
  const listing = await Listing.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { returnDocument: 'after' }
  )
    .populate('seller', 'name avatar ratingAvg ratingCount isEmailVerified createdAt address')
    .populate('category', 'name slug');

  if (!listing) throw new AppError('Listing not found.', 404);
  return listing;
};

// ── Update listing ────────────────────────────────────────────────────────────
const updateListing = async (id, sellerId, data, files = []) => {
  const listing = await Listing.findById(id);
  if (!listing) throw new AppError('Listing not found.', 404);
  if (listing.seller.toString() !== sellerId.toString())
    throw new AppError('You can only edit your own listings.', 403);
  if (['sold', 'removed'].includes(listing.status))
    throw new AppError('Cannot edit a sold or removed listing.', 400);

  // Upload new images if any
  if (files.length) {
    const newImages = await Promise.all(
      files.map(async (f) => {
        const result = await uploadToCloudinary(f.buffer);
        return { url: result.secure_url, publicId: result.public_id };
      })
    );
    listing.images = [...listing.images, ...newImages].slice(0, 6);
  }

  // Prevent modifying critical system/immutable fields
  delete data.seller;
  delete data.impactKg;
  delete data.co2SavedKg;
  delete data.status;
  delete data.views;

  Object.assign(listing, data);
  await listing.save();
  return listing;
};

// ── Delete listing ────────────────────────────────────────────────────────────
const deleteListing = async (id, userId, role) => {
  const listing = await Listing.findById(id);
  if (!listing) throw new AppError('Listing not found.', 404);
  if (role !== 'admin' && listing.seller.toString() !== userId.toString())
    throw new AppError('You can only delete your own listings.', 403);

  // Delete images from Cloudinary safely
  const imageDeletions = (listing.images || [])
    .filter((img) => img && img.publicId)
    .map((img) => deleteFromCloudinary(img.publicId));
  await Promise.allSettled(imageDeletions);
  await listing.deleteOne();
};

// ── Toggle wishlist ───────────────────────────────────────────────────────────
const toggleWishlist = async (userId, listingId) => {
  const listing = await Listing.findById(listingId);
  if (!listing) throw new AppError('Listing not found.', 404);

  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, listings: [] });

  const idx = wishlist.listings.findIndex((l) => l.toString() === listingId);
  let added;
  if (idx === -1) {
    wishlist.listings.push(listingId);
    added = true;
  } else {
    wishlist.listings.splice(idx, 1);
    added = false;
  }
  await wishlist.save();
  return { added, wishlistCount: wishlist.listings.length };
};

// ── My listings ───────────────────────────────────────────────────────────────
const getMyListings = async (sellerId, page = 1, limit = 12) => {
  const skip = (page - 1) * limit;
  const [listings, total] = await Promise.all([
    Listing.find({ seller: sellerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug'),
    Listing.countDocuments({ seller: sellerId }),
  ]);
  return { listings, total, page, limit };
};

module.exports = {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  toggleWishlist,
  getMyListings,
};
