// src/controllers/admin.controller.js
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const User = require('../models/User.model');
const Listing = require('../models/Listing.model');
const Order = require('../models/Order.model');
const Report = require('../models/Report.model');
const Category = require('../models/Category.model');
const AppError = require('../utils/AppError');

// ── Stats ─────────────────────────────────────────────────────────────────────
const getStats = asyncHandler(async (req, res) => {
  const [users, listings, orders, pendingListings, openReports] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments(),
    Order.countDocuments(),
    Listing.countDocuments({ status: 'pending' }),
    Report.countDocuments({ status: 'open' }),
  ]);
  apiResponse(res, 200, 'Stats fetched.', { users, listings, orders, pendingListings, openReports });
});

// ── Listings moderation ───────────────────────────────────────────────────────
const getPendingListings = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;
  const status = req.query.status || 'pending';

  const [items, total] = await Promise.all([
    Listing.find({ status })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('seller', 'name email avatar')
      .populate('category', 'name'),
    Listing.countDocuments({ status }),
  ]);
  apiResponse(res, 200, 'Listings fetched.', items, { total, page, limit });
});

const approveListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(req.params.id, { status: 'active', rejectionReason: '' }, { returnDocument: 'after' });
  if (!listing) throw new AppError('Listing not found.', 404);
  apiResponse(res, 200, 'Listing approved.', listing);
});

const rejectListing = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  if (!reason) throw new AppError('Please provide a rejection reason.', 400);
  const listing = await Listing.findByIdAndUpdate(req.params.id, { status: 'rejected', rejectionReason: reason }, { returnDocument: 'after' });
  if (!listing) throw new AppError('Listing not found.', 404);
  apiResponse(res, 200, 'Listing rejected.', listing);
});

// ── User management ───────────────────────────────────────────────────────────
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;
  const q = req.query.q;
  const filter = q ? { $or: [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }] } : {};
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  apiResponse(res, 200, 'Users fetched.', users, { total, page, limit });
});

const banUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found.', 404);
  if (user.role === 'admin') throw new AppError('Cannot ban an admin.', 403);
  user.isBanned = !user.isBanned;
  await user.save({ validateBeforeSave: false });
  apiResponse(res, 200, `User ${user.isBanned ? 'banned' : 'unbanned'}.`, { isBanned: user.isBanned });
});

// ── Reports ───────────────────────────────────────────────────────────────────
const getReports = asyncHandler(async (req, res) => {
  const status = req.query.status || 'open';
  const reports = await Report.find({ status })
    .sort({ createdAt: -1 })
    .populate('reporter', 'name email')
    .populate('targetId')
    .limit(50);
  apiResponse(res, 200, 'Reports fetched.', reports);
});

const resolveReport = asyncHandler(async (req, res) => {
  const { status, resolutionNote } = req.body;
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status, resolutionNote, resolvedBy: req.user._id },
    { new: true }
  );
  if (!report) throw new AppError('Report not found.', 404);
  apiResponse(res, 200, 'Report resolved.', report);
});

// ── Categories ────────────────────────────────────────────────────────────────
const slugify = require('../utils/slugify');

const getCategories = asyncHandler(async (req, res) => {
  const cats = await Category.find().sort({ name: 1 });
  apiResponse(res, 200, 'Categories fetched.', cats);
});

const createCategory = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (!data.slug && data.name) {
    data.slug = slugify(data.name);
  }
  const cat = await Category.create(data);
  apiResponse(res, 201, 'Category created.', cat);
});

const updateCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
  if (!cat) throw new AppError('Category not found.', 404);
  apiResponse(res, 200, 'Category updated.', cat);
});

const deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  apiResponse(res, 200, 'Category deleted.');
});

module.exports = {
  getStats,
  getPendingListings,
  approveListing,
  rejectListing,
  getUsers,
  banUser,
  getReports,
  resolveReport,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
