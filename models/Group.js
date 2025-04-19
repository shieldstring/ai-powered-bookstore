const mongoose = require('mongoose');

const groupSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    discussions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Discussion' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);