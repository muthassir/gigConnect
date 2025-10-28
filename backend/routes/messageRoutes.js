const express = require('express');
const { sendMessage, getMessages, getConversation, deleteMessage } = require('../controllers/messageController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', auth, sendMessage);
router.get('/', auth, getMessages);
router.get('/conversation/:withUserId', auth, getConversation);
router.delete('/:messageId', auth, deleteMessage);

module.exports = router;