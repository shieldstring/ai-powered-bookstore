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
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
      set: (v) => parseFloat(v.toFixed(2)), // Ensure 2 decimal places
    },
    originalPrice: {
      type: Number,
      min: [0, "Price cannot be negative"],
      set: (v) => parseFloat(v.toFixed(2)),
    },
    isbn: {
      type: String,
      unique: true,
      validate: {
        validator: function (v) {
          return /^(?:\d{9}[\dXx]|\d{13})$/.test(v);
        },
        message: (props) => `${props.value} is not a valid ISBN!`,
      },
    },
    language: { type: String, default: "English" },
    format: {
      type: String,
      enum: ["Paperback", "Hardcover", "E-book", "Audiobook"],
      default: "Paperback",
    },
    publishDate: { type: Date },
    publisher: { type: String, trim: true },
    image: {
      type: String,
      validate: {
        validator: function (v) {
          return /^(https?:\/\/).+\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(v);
        },
        message: (props) => `${props.value} is not a valid image URL!`,
      },
    },
    category: {
      type: String,
      enum: [
        "Fiction",
        "Non-Fiction",
        "Science",
        "History",
        "Biography",
        "Fantasy",
        "Romance",
        "Thriller",
      ],
      required: true,
    },
    affiliateLink: {
      type: String,
      validate: {
        validator: function (v) {
          return /^(https?:\/\/)/.test(v);
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },
    inventory: {
      type: Number,
      default: 0,
      min: [0, "Inventory cannot be negative"],
      required: true,
    },
    purchaseCount: { type: Number, default: 0, min: 0 },
    reviews: [reviewSchema],
    isActive: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
    salesHistory: [
      {
        date: { type: Date, default: Date.now },
        quantity: Number,
        revenue: Number,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for average rating
bookSchema.virtual("averageRating").get(function () {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  return parseFloat((total / this.reviews.length).toFixed(1));
});

// Virtual for review count
bookSchema.virtual("reviewCount").get(function () {
  return this.reviews ? this.reviews.length : 0;
});

// Virtual for discount percentage
bookSchema.virtual("discountPercentage").get(function () {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(
    ((this.originalPrice - this.price) / this.originalPrice) * 100
  );
});

// Check inventory before saving
bookSchema.pre("save", function (next) {
  if (this.isModified("inventory") && this.inventory < 0) {
    throw new Error("Inventory cannot be negative");
  }
  next();
});

// Static method to check stock availability
bookSchema.statics.checkStock = async function (bookId, quantity) {
  const book = await this.findById(bookId);
  if (!book) throw new Error("Book not found");
  if (!book.isActive) throw new Error("Book is not available");
  if (book.inventory < quantity) throw new Error("Insufficient stock");
  return book;
};

// Method to update inventory
bookSchema.methods.updateInventory = async function (quantity) {
  const newInventory = this.inventory + quantity;
  if (newInventory < 0) throw new Error("Insufficient stock");

  this.inventory = newInventory;
  if (quantity < 0) {
    this.purchaseCount += Math.abs(quantity);
  }
  return this.save();
};

// Method to increment views
bookSchema.methods.incrementViews = async function () {
  this.viewCount += 1;
  return this.save();
};

// Indexes
bookSchema.index({ title: "text", author: "text", description: "text" });
bookSchema.index({ category: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ averageRating: -1 });
bookSchema.index({ purchaseCount: -1 });
bookSchema.index({ isActive: 1 });

module.exports = mongoose.model("Book", bookSchema);
