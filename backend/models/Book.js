const mongoose = require('mongoose');

const bookSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    genre: { type: String },
    affiliateLink: { type: String }, // Affiliate link for the book
    purchaseCount: { type: Number, default: 0 }, // Track number of purchases
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);