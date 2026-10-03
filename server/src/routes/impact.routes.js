// src/routes/impact.routes.js
const express = require('express');
const router = express.Router();
const impactController = require('../controllers/impact.controller');

router.get('/summary', impactController.getImpactSummary); // public
router.get('/overview', impactController.getImpactSummary); // public alias
router.get('/user/:id', impactController.getUserImpact); // public

module.exports = router;
