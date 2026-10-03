// src/services/user.service.js
const User = require('../models/User.model');
const Listing = require('../models/Listing.model');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');

const getMe = async (userId) => User.findById(userId);

const updateMe = async (userId, data) => {
  // Don't allow password or role updates here
  const safe = (({ name, phone, sharePhone, address }) => ({ name, phone, sharePhone, address }))(data);
  const user = await User.findByIdAndUpdate(userId, safe, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found.', 404);
  return user;
};

const updateAvatar = async (userId, file) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found.', 404);

  // Delete old avatar from Cloudinary safely
  if (user.avatar && user.avatar.publicId) {
    try {
      await cloudinary.uploader.destroy(user.avatar.publicId);
    } catch {
      // Ignore deletion failure if image does not exist
    }
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'avatars', transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }] },
      (err, res) => (err ? reject(err) : resolve(res))
    );
    stream.end(file.buffer);
  });

  user.avatar = { url: result.secure_url, publicId: result.public_id };
  await user.save({ validateBeforeSave: false });
  return user;
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('name avatar ratingAvg ratingCount address createdAt isEmailVerified');
  if (!user) throw new AppError('User not found.', 404);

  const listings = await Listing.find({ seller: userId, status: 'active' })
    .sort({ createdAt: -1 })
    .limit(8)
    .populate('category', 'name slug');

  return { user, listings };
};

module.exports = { getMe, updateMe, updateAvatar, getUserProfile };
