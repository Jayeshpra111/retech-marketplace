// src/routes/chat.routes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/conversations', protect, chatController.getConversations);
router.post('/conversations', protect, chatController.createConversation);
router.get('/conversations/:conversationId/messages', protect, chatController.getMessages);
router.post('/conversations/:conversationId/messages', protect, chatController.sendMessage);

module.exports = router;
