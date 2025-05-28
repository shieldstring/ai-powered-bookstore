const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User'); // Assuming User model is needed for population

// Send a private message
const sendMessage = async (req, res) => {
  const { conversationId, text } = req.body;
  const senderId = req.user._id; // Assuming user is authenticated and available in req.user

  try {
    // Find the conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Ensure the sender is a participant in the conversation
    if (!conversation.participants.includes(senderId)) {
      return res.status(403).json({ message: 'You are not a participant in this conversation' });
    }

    // Create the new message
    const message = await Message.create({
      sender: senderId,
      conversation: conversationId,
      text,
    });

    // Update the last message in the conversation
    conversation.lastMessage = message._id;
    await conversation.save();

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get conversations for the logged-in user
const getConversations = async (req, res) => {
  const userId = req.user._id;

  try {
    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', '_id name profilePicture') // Populate participants, excluding password
      .populate('lastMessage') // Populate the last message for sorting
      .sort({ 'lastMessage.createdAt': -1 }) // Sort by the createdAt of the last message descending
      .lean(); // Use lean() for better performance if not modifying the results

    // Filter out the current user from the participants list in each conversation
    const formattedConversations = conversations.map(conversation => {
      return {
        ...conversation,
        participants: conversation.participants.filter(participant => participant._id.toString() !== userId.toString()),
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages within a specific conversation
const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;

  try {
    // Ensure the user is a participant in the conversation before fetching messages
    const conversation = await Conversation.findOne({ _id: conversationId, participants: userId });

    if (!conversation) {
      return res.status(403).json({ message: 'You are not a participant in this conversation' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', '_id name profilePicture') // Populate sender details
      .sort({ createdAt: 1 }); // Sort by creation date ascending

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new conversation
const createConversation = async (req, res) => {
  const { participants } = req.body; // participants should be an array of user IDs
  const userId = req.user._id;

  // Ensure the logged-in user is included in the participants
  if (!participants.includes(userId.toString())) {
    participants.push(userId.toString());
  }

  try {
    // Optional: Check if a conversation with the same participants already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: participants, $size: participants.length },
    });
    if (existingConversation) {
      return res.status(200).json(existingConversation); // Return existing conversation
    }

    const newConversation = await Conversation.create({ participants });
    res.status(201).json(newConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
  createConversation,
};