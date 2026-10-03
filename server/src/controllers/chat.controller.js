// src/controllers/chat.controller.js
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const AppError = require('../utils/AppError');

// ── Conversations ─────────────────────────────────────────────────────────────

const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .sort({ updatedAt: -1 })
    .populate('participants', 'name avatar isEmailVerified')
    .populate('lastMessage')
    .populate('listing', 'title images price status');
  apiResponse(res, 200, 'Conversations fetched.', conversations);
});

const createConversation = asyncHandler(async (req, res) => {
  const { participantId, listingId } = req.body;
  if (participantId === req.user._id.toString())
    throw new AppError('Cannot start a conversation with yourself.', 400);

  // Find existing conversation
  let conv = await Conversation.findOne({
    participants: { $all: [req.user._id, participantId] },
    ...(listingId && { listing: listingId }),
  });

  if (!conv) {
    conv = await Conversation.create({
      participants: [req.user._id, participantId],
      listing: listingId || null,
    });
  }

  await conv.populate('participants', 'name avatar');
  await conv.populate('listing', 'title images price status');
  apiResponse(res, 200, 'Conversation ready.', conv);
});

// ── Messages ──────────────────────────────────────────────────────────────────

const getMessages = asyncHandler(async (req, res) => {
  const conv = await Conversation.findById(req.params.conversationId);
  if (!conv) throw new AppError('Conversation not found.', 404);
  const isParticipant = conv.participants.some((p) => p.toString() === req.user._id.toString());
  if (!isParticipant) throw new AppError('Access denied.', 403);

  const page = parseInt(req.query.page, 10) || 1;
  const limit = 30;
  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    Message.find({ conversation: req.params.conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name avatar'),
    Message.countDocuments({ conversation: req.params.conversationId }),
  ]);

  // Mark messages as read
  await Message.updateMany(
    { conversation: req.params.conversationId, readBy: { $ne: req.user._id } },
    { $addToSet: { readBy: req.user._id } }
  );

  apiResponse(res, 200, 'Messages fetched.', messages.reverse(), { total, page, limit });
});

const sendMessage = asyncHandler(async (req, res) => {
  const conv = await Conversation.findById(req.params.conversationId);
  if (!conv) throw new AppError('Conversation not found.', 404);
  const isParticipant = conv.participants.some((p) => p.toString() === req.user._id.toString());
  if (!isParticipant) throw new AppError('Access denied.', 403);

  const message = await Message.create({
    conversation: conv._id,
    sender: req.user._id,
    text: req.body.text,
    readBy: [req.user._id],
  });

  // Update conversation's lastMessage + updatedAt
  await Conversation.findByIdAndUpdate(conv._id, { lastMessage: message._id, updatedAt: new Date() });

  await message.populate('sender', 'name avatar');

  // Emit via Socket.io (if socket server is running)
  const io = req.app.get('io');
  if (io) {
    io.to(`conv:${conv._id}`).emit('newMessage', message);
    conv.participants.forEach((pid) => {
      io.to(`user:${pid}`).emit('newMessage', message);
    });
  }

  apiResponse(res, 201, 'Message sent.', message);
});

module.exports = { getConversations, createConversation, getMessages, sendMessage };
