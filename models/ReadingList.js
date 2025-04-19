const mongoose = require('mongoose');

const readingListSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReadingList', readingListSchema);