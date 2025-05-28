const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createConversation, getConversations, getMessages, sendMessage } = require('../controllers/messageController');

const router = express.Router();

// Conversation routes
router.post('/conversations', protect, createConversation);
router.get('/conversations', protect, getConversations);

// Message routes within a conversation
router.get('/conversations/:conversationId/messages', protect, getMessages);
router.post('/conversations/:conversationId/messages', protect, sendMessage);

module.exports = router;