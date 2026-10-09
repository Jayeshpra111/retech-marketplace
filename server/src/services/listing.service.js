// src/services/listing.service.js
const mongoose = require('mongoose');
const Listing = require('../models/Listing.model');
const Category = require('../models/Category.model');
const Wishlist = require('../models/Wishlist.model');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');
const Order = require('../models/Order.model');

const escapeRegex = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

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
  if (!category) {
    category = await Category.findOne({ name: new RegExp(`^${escapeRegex(String(data.category))}$`, 'i') });
  }
  if (!category) {
    category = (await Category.findOne({ slug: 'other' })) || (await Category.findOne());
  }
  if (!category) throw new AppError('Category not found.', 404);

  // Upload images if files provided, or format existing image URLs
  let images = [];
  if (files && files.length > 0) {
    images = await Promise.all(
      files.map(async (f) => {
        try {
          const result = await uploadToCloudinary(f.buffer);
          return { url: result.secure_url, publicId: result.public_id };
        } catch {
          return { url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600', publicId: 'fallback' };
        }
      })
    );
  } else if (Array.isArray(data.images) && data.images.length > 0) {
    images = data.images.map((img) =>
      typeof img === 'string' ? { url: img, publicId: '' } : img
    );
  } else {
    images = [{ url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600', publicId: 'default' }];
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
    status: 'pending', // listings require admin moderation before going live
  });

  return listing;
};

// ── Get listings (browse) ─────────────────────────────────────────────────────
const getListings = async (query) => {
  const { q, category, brand, minPrice, maxPrice, condition, city, isComponent, sort, page, limit } = query;

  const filter = { status: 'active' };

  if (q) filter.$text = { $search: q };

  // Resolve category slug or ID
  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    } else {
      const catDoc = await Category.findOne({ slug: String(category).toLowerCase() });
      if (catDoc) {
        filter.category = catDoc._id;
      } else {
        filter.category = new mongoose.Types.ObjectId(); // safely matches nothing
      }
    }
  } else if (isComponent !== undefined) {
    const compCats = await Category.find({ isComponent: Boolean(isComponent) }).distinct('_id');
    filter.category = { $in: compCats };
  }

  // Escape regex input to prevent ReDoS attacks
  if (brand) filter.brand = { $regex: escapeRegex(brand), $options: 'i' };
  if (condition) filter.condition = condition;
  if (city) filter['location.city'] = { $regex: escapeRegex(city), $options: 'i' };
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
      .populate('category', 'name slug isComponent'),
    Listing.countDocuments(filter),
  ]);

  return { listings, total, page, limit, pages: Math.ceil(total / limit) };
};

// ── Get single listing ────────────────────────────────────────────────────────
const getListingById = async (id, user = null) => {
  const listing = await Listing.findById(id)
    .populate('seller', 'name avatar ratingAvg ratingCount isEmailVerified createdAt address')
    .populate('category', 'name slug isComponent');

  if (!listing) throw new AppError('Listing not found.', 404);

  // Hidden listing visibility: non-active listings only visible to owner or admin
  if (listing.status !== 'active') {
    const isOwner = user && listing.seller._id.toString() === user._id.toString();
    const isAdmin = user && user.role === 'admin';
    if (!isOwner && !isAdmin) {
      throw new AppError('Listing not found or not active.', 404);
    }
  }

  // Increment views only for active listings viewed by non-owners
  const isOwner = user && listing.seller._id.toString() === user._id.toString();
  if (listing.status === 'active' && !isOwner) {
    await Listing.findByIdAndUpdate(id, { $inc: { views: 1 } });
    listing.views += 1;
  }

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

  // Handle location update safely
  if (data.city || data.state || (data.location && typeof data.location === 'object')) {
    listing.location = {
      city: data.city || data.location?.city || listing.location?.city || 'Bangalore',
      state: data.state || data.location?.state || listing.location?.state || 'KA',
      coords: listing.location?.coords || { type: 'Point', coordinates: [77.5946, 12.9716] },
    };
    delete data.city;
    delete data.state;
    delete data.location;
  }

  // Handle category update and impact calculation
  if (data.category) {
    let catId = data.category;
    if (typeof catId === 'object' && catId._id) catId = catId._id;
    if (!mongoose.Types.ObjectId.isValid(catId)) {
      const catDoc = await Category.findOne({ slug: String(catId).toLowerCase() });
      if (catDoc) catId = catDoc._id;
    }
    if (mongoose.Types.ObjectId.isValid(catId)) {
      const categoryDoc = await Category.findById(catId);
      if (categoryDoc) {
        listing.category = categoryDoc._id;
        listing.impactKg = categoryDoc.impactWeightKg || 0.5;
        listing.co2SavedKg = Math.round((categoryDoc.impactWeightKg || 0.5) * (categoryDoc.co2Factor || 74));
      }
    }
    delete data.category;
  }

  // Prevent modifying critical system/immutable fields
  delete data.seller;
  delete data.impactKg;
  delete data.co2SavedKg;
  delete data.status;
  delete data.views;

  Object.assign(listing, data);
  await listing.save();
  return await Listing.findById(listing._id)
    .populate('seller', 'name avatar ratingAvg ratingCount isEmailVerified')
    .populate('category', 'name slug isComponent');
};

// ── Delete listing ────────────────────────────────────────────────────────────
const deleteListing = async (id, userId, role) => {
  const listing = await Listing.findById(id);
  if (!listing) throw new AppError('Listing not found.', 404);
  if (role !== 'admin' && listing.seller.toString() !== userId.toString()) {
    throw new AppError('You can only delete your own listings.', 403);
  }

  // Block delete if open active orders exist
  const activeOrder = await Order.findOne({
    listing: id,
    orderStatus: { $in: ['pending', 'paid', 'confirmed', 'shipped', 'delivered', 'disputed'] },
  });
  if (activeOrder) {
    throw new AppError(
      'Cannot delete listing with an active order in progress. Resolve or cancel the order first.',
      400
    );
  }

  // If past orders reference this listing, soft delete to preserve references
  const anyOrder = await Order.findOne({ listing: id });
  if (anyOrder) {
    listing.status = 'removed';
    await listing.save();
    return { softDeleted: true };
  }

  // Otherwise, safe to clean up images and delete document
  const imageDeletions = (listing.images || [])
    .filter((img) => img && img.publicId)
    .map((img) => deleteFromCloudinary(img.publicId));
  await Promise.allSettled(imageDeletions);
  await listing.deleteOne();
  return { deleted: true };
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
