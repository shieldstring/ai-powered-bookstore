const Message = require('../models/Message');

// Send a private message
const sendMessage = async (req, res) => {
  const { receiver, content } = req.body;

  try {
    const message = await Message.create({ sender: req.user._id, receiver, content });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages between two users
const getMessages = async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { sendMessage, getMessages };