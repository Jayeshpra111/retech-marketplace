// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.get('/me', protect, userController.getMe);
router.patch('/me', protect, userController.updateMe);
router.patch('/me/avatar', protect, upload.single('avatar'), userController.updateAvatar);
router.get('/:id', userController.getUserProfile); // public

module.exports = router;
