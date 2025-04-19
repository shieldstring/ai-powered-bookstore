const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true }
);

const bookSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    genre: { type: String },
    affiliateLink: { type: String },
    inventory: { type: Number, default: 0 }, // Track inventory
    purchaseCount: { type: Number, default: 0 },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

// Add indexes for frequently queried fields
bookSchema.index({ title: 1 }); // Index for title
bookSchema.index({ genre: 1 }); // Index for genre

module.exports = mongoose.model('Book', bookSchema);