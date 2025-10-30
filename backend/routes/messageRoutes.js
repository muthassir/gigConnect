const express = require('express');
const { 
  getMyConversations, 
  getConversationMessages, 
  sendMessage, 
  startConversation,
  markAsRead 
} = require('../controllers/messageController.js');
const auth = require('../middleware/authMiddleware.js');

const router = express.Router();

router.get('/conversations', auth, getMyConversations);

router.get('/conversations/:conversationId', auth, getConversationMessages);

router.post('/conversations/start', auth, startConversation);

router.post('/', auth, sendMessage);

router.put('/conversations/:conversationId/read', auth, markAsRead);

module.exports = router;