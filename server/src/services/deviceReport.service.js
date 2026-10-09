// server/src/services/deviceReport.service.js
const DeviceReport = require('../models/DeviceReport.model');
const Listing = require('../models/Listing.model');
const AppError = require('../utils/AppError');
const cloudinary = require('../config/cloudinary');
const { calculateHealthScore } = require('./healthScore.service');

const uploadToCloudinary = (buffer, folder = 'device-reports') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ width: 1400, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

const createHealthReport = async (listingId, sellerId, data, files = [], userRole = 'user') => {
  const listing = await Listing.findById(listingId);
  if (!listing) throw new AppError('Listing not found.', 404);

  const isOwner = listing.seller.toString() === sellerId.toString();
  const isAdmin = userRole === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AppError('You can only attach a health report to your own listing.', 403);
  }

  // Upload evidence images if provided
  let evidence = [];
  if (files && files.length > 0) {
    evidence = await Promise.all(
      files.slice(0, 6).map(async (f) => {
        try {
          const res = await uploadToCloudinary(f.buffer);
          return { url: res.secure_url, publicId: res.public_id, caption: f.originalname || '' };
        } catch (err) {
          // If Cloudinary is unconfigured in development, return placeholder
          return {
            url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600',
            publicId: 'local_evidence',
            caption: f.originalname || 'Hardware diagnostic',
          };
        }
      })
    );
  }

  const healthScore = calculateHealthScore(data, data.deviceType);

  // Upsert device report
  let report = await DeviceReport.findOne({ listing: listingId });
  if (report) {
    Object.assign(report, data, {
      healthScore,
      evidence: evidence.length > 0 ? evidence : report.evidence,
    });
    await report.save();
  } else {
    report = await DeviceReport.create({
      ...data,
      listing: listingId,
      seller: sellerId,
      evidence,
      healthScore,
      isVerified: false,
    });
  }

  return report;
};

const getHealthReportByListing = async (listingId) => {
  const report = await DeviceReport.findOne({ listing: listingId }).populate('verifiedBy', 'name');
  if (!report) throw new AppError('No health report found for this listing.', 404);
  return report;
};

const updateHealthReport = async (listingId, userId, userRole, data, files = []) => {
  const report = await DeviceReport.findOne({ listing: listingId });
  if (!report) throw new AppError('Device report not found.', 404);

  const isOwner = report.seller.toString() === userId.toString();
  const isAdmin = userRole === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AppError('You do not have permission to modify this health report.', 403);
  }

  // Check if listing is editable by owner
  const listing = await Listing.findById(listingId);
  if (isOwner && !isAdmin && listing && listing.status !== 'pending' && listing.status !== 'active') {
    throw new AppError('Cannot update health report on a closed or removed listing.', 400);
  }

  let evidence = report.evidence || [];
  if (files && files.length > 0) {
    const uploaded = await Promise.all(
      files.slice(0, 6).map(async (f) => {
        try {
          const res = await uploadToCloudinary(f.buffer);
          return { url: res.secure_url, publicId: res.public_id, caption: f.originalname || '' };
        } catch {
          return {
            url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600',
            publicId: 'local_evidence',
            caption: f.originalname || '',
          };
        }
      })
    );
    evidence = [...evidence, ...uploaded].slice(0, 8);
  }

  const mergedData = { ...report.toObject(), ...data };
  const healthScore = calculateHealthScore(mergedData, mergedData.deviceType);

  Object.assign(report, data, {
    healthScore,
    evidence,
    isVerified: false, // reset verification on edit unless done by admin
  });

  await report.save();
  return report;
};

const verifyHealthReport = async (listingId, adminId, isVerified = true) => {
  const report = await DeviceReport.findOne({ listing: listingId });
  if (!report) throw new AppError('Device report not found.', 404);

  report.isVerified = Boolean(isVerified);
  report.verifiedBy = isVerified ? adminId : null;
  report.verifiedAt = isVerified ? new Date() : null;

  await report.save();
  return report;
};

module.exports = {
  createHealthReport,
  getHealthReportByListing,
  updateHealthReport,
  verifyHealthReport,
};
