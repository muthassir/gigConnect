const { Message, Conversation } = require("../models/Message.js");
const User = require("../models/User.js");

// Get all conversations for current user
exports.getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId
    })
    .populate('participants', 'username avatar role')
    .populate('gig', 'title')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get messages for a specific conversation
exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Check if user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.userId
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation'
      });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Start a new conversation
exports.startConversation = async (req, res) => {
  try {
    const { receiverId, gigId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID is required'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, receiverId] },
      ...(gigId && { gig: gigId })
    })
    .populate('participants', 'username avatar role')
    .populate('gig', 'title')
    .populate('lastMessage');

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [req.userId, receiverId],
        ...(gigId && { gig: gigId })
      });

      await conversation.save();
      await conversation.populate('participants', 'username avatar role');
      if (gigId) {
        await conversation.populate('gig', 'title');
      }
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content, receiverId } = req.body;

    if (!content || !conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Content and conversation ID are required'
      });
    }

    // Check if user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.userId
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send message in this conversation'
      });
    }

    // Create new message
    const message = new Message({
      conversation: conversationId,
      sender: req.userId,
      content: content.trim()
    });

    await message.save();
    await message.populate('sender', 'username avatar');

    // Update conversation's last message
    conversation.lastMessage = message._id;
    await conversation.save();

    res.json({
      success: true,
      data: message,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.userId },
        read: false
      },
      { read: true }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};