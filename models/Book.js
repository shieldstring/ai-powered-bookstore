const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
    originalPrice: { type: Number },
    isbn: { type: String },
    language: { type: String },
    format: { type: String },
    publishDate: { type: Date },
    publisher: { type: String },
    image: { type: String },
    tag: { type: String },
    category: { type: String },
    affiliateLink: { type: String },
    inventory: { type: Number, default: 0 },
    purchaseCount: { type: Number, default: 0 },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

// Virtual for average rating
bookSchema.virtual('rating').get(function() {
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / this.reviews.length).toFixed(1);
  }
  return 0;
});

// Virtual for review count
bookSchema.virtual('reviewCount').get(function() {
  return this.reviews ? this.reviews.length : 0;
});

// Make sure virtuals are included when converting to JSON
bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

// Add indexes for frequently queried fields
bookSchema.index({ title: 1 }); // Index for title
bookSchema.index({ category: 1 }); // Index for category
bookSchema.index({ author: 1 }); // Index for author
bookSchema.index({ isbn: 1 }); // Index for ISBN (unique identifier)
bookSchema.index({ price: 1 }); // Index for price sorting

module.exports = mongoose.model("Book", bookSchema);