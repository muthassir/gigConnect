const User = require('../models/User');
const Message = require('../models/Message');

exports.sendMessage = async (req, res) => { 
    const { recipientId, content } = req.body;
    const senderId = req.user.id;   
    try {
        const sender = await User.findById(senderId);
        const recipient = await User.findById(recipientId);
        if (!sender || !recipient) {
            return res.status(404).json({ message: 'Sender or recipient not found' });
        }
        const newMessage = new Message({
            sender: senderId,
            recipient: recipientId,
            content
        });
        await newMessage.save();
        res.status(201).json({ message: 'Message sent successfully', messageData: newMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error while sending message' });
    }
};
exports.getMessages = async (req, res) => {
    const userId = req.user.id;
    try {
        const messages = await Message.find({
            $or: [{ sender: userId }, { recipient: userId }]
        }).sort({ createdAt: -1 });
        res.status(200).json({ messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error while fetching messages' });
    }
};

exports.getConversation = async (req, res) => {
    const userId = req.user.id;
    const { withUserId } = req.params;
    try {
        const messages = await Message.find({
            $or: [  
                { sender: userId, recipient: withUserId },
                { sender: withUserId, recipient: userId }
            ]
        }).sort({ createdAt: 1 }); 
        res.status(200).json({ messages });
    }
    catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ message: 'Server error while fetching conversation' });
    }
};

exports.deleteMessage = async (req, res) => {
    const userId = req.user.id;
    const { messageId } = req.params;
    try {
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        if (message.sender.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this message' });
        }
        await message.remove();
        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Server error while deleting message' });
    }
};

