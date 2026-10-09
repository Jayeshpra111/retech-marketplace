// server/src/controllers/deviceReport.controller.js
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const deviceReportService = require('../services/deviceReport.service');
const { deviceReportSchema } = require('../validators/deviceReport.validators');

const createHealthReport = asyncHandler(async (req, res) => {
  const parsedData = deviceReportSchema.parse(req.body);
  const report = await deviceReportService.createHealthReport(
    req.params.id,
    req.user._id,
    parsedData,
    req.files || [],
    req.user.role
  );
  apiResponse(res, 201, 'Device health report created.', report);
});

const getHealthReport = asyncHandler(async (req, res) => {
  const report = await deviceReportService.getHealthReportByListing(req.params.id);
  apiResponse(res, 200, 'Device health report fetched.', report);
});

const updateHealthReport = asyncHandler(async (req, res) => {
  const parsedData = deviceReportSchema.partial().parse(req.body);
  const report = await deviceReportService.updateHealthReport(
    req.params.id,
    req.user._id,
    req.user.role,
    parsedData,
    req.files || []
  );
  apiResponse(res, 200, 'Device health report updated.', report);
});

const verifyHealthReport = asyncHandler(async (req, res) => {
  const { isVerified = true } = req.body;
  const report = await deviceReportService.verifyHealthReport(
    req.params.id,
    req.user._id,
    isVerified
  );
  apiResponse(res, 200, isVerified ? 'Report marked verified.' : 'Verification revoked.', report);
});

module.exports = {
  createHealthReport,
  getHealthReport,
  updateHealthReport,
  verifyHealthReport,
};
