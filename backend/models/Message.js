const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }],
  gig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Gig"
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  }
}, {
  timestamps: true
});

const Message = mongoose.model("Message", messageSchema);
const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = { Message, Conversation };