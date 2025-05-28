const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The user who sent the message
   // Assuming you are moving towards a conversation-based model,
    // the receiver field might become less relevant for group chats.
    // For direct messages, it indicates the other participant.
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true }, // The conversation this message belongs to
    text: { type: String, required: true }, // The message content
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who have read this message
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);