// src/sockets/index.js — Socket.io server with JWT auth handshake
const { verifyAccessToken } = require('../utils/token');
const User = require('../models/User.model');
const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const logger = require('../config/logger');

const initSocket = (io) => {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication error: no token'));
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).lean();
      if (!user) return next(new Error('Authentication error: user not found'));
      if (user.isBanned) return next(new Error('Authentication error: account suspended'));

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.userId}`);

    // Join personal room so other users can target this client
    socket.join(`user:${socket.userId}`);

    socket.on('joinConversation', async (conversationId) => {
      try {
        const conv = await Conversation.findById(conversationId);
        if (conv && conv.participants.some((p) => p.toString() === socket.userId)) {
          socket.join(`conv:${conversationId}`);
        }
      } catch (err) {
        logger.error({ err }, 'Error joining conversation room');
      }
    });

    socket.on('leaveConversation', (conversationId) => {
      socket.leave(`conv:${conversationId}`);
    });

    socket.on('sendMessage', async ({ conversationId, text }, callback) => {
      try {
        if (!conversationId || !text || !text.trim()) {
          if (callback) callback({ error: 'Text and conversationId are required' });
          return;
        }

        const conv = await Conversation.findById(conversationId);
        if (!conv) {
          if (callback) callback({ error: 'Conversation not found' });
          return;
        }

        const isParticipant = conv.participants.some((p) => p.toString() === socket.userId);
        if (!isParticipant) {
          if (callback) callback({ error: 'Access denied' });
          return;
        }

        const message = await Message.create({
          conversation: conv._id,
          sender: socket.userId,
          text: text.trim(),
          readBy: [socket.userId],
        });

        await Conversation.findByIdAndUpdate(conv._id, {
          lastMessage: message._id,
          updatedAt: new Date(),
        });

        await message.populate('sender', 'name avatar');

        // Broadcast to conversation room once (prevents duplicate deliveries)
        io.to(`conv:${conversationId}`).emit('newMessage', message);

        // Notify other participants for inbox preview / unread counter
        conv.participants.forEach((pid) => {
          if (pid.toString() !== socket.userId) {
            io.to(`user:${pid.toString()}`).emit('conversationUpdated', {
              conversationId,
              lastMessage: message,
            });
          }
        });

        if (callback) callback({ success: true, message });
      } catch (err) {
        logger.error({ err }, 'Error in sendMessage socket handler');
        if (callback) callback({ error: 'Failed to send message' });
      }
    });

    socket.on('typing', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('userTyping', {
        conversationId,
        userId: socket.userId,
      });
    });

    socket.on('stopTyping', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('userStopTyping', {
        conversationId,
        userId: socket.userId,
      });
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.userId}`);
    });
  });
};

module.exports = initSocket;
