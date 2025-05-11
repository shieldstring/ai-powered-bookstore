const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      maxlength: [500, "Comment cannot exceed 500 characters"],
      trim: true,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const salesHistorySchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  revenue: {
    type: Number,
    required: true,
    min: 0,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
});

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
      maxlength: [100, "Author name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      set: (v) => parseFloat(v.toFixed(2)),
    },
    originalPrice: {
      type: Number,
      min: [0, "Price cannot be negative"],
      set: (v) => parseFloat(v.toFixed(2)),
      validate: {
        validator: function (v) {
          return v === undefined || v >= this.price;
        },
        message:
          "Original price must be greater than or equal to current price",
      },
    },
    isbn: {
      type: String,
      unique: true,
      required: [true, "ISBN is required"],
      validate: {
        validator: function (v) {
          return /^(?:\d{9}[\dXx]|\d{13})$/.test(v);
        },
        message: (props) => `${props.value} is not a valid ISBN!`,
      },
    },
    language: {
      type: String,
      default: "English",
      enum: {
        values: [
          "English",
          "Spanish",
          "French",
          "German",
          "Chinese",
          "Japanese",
          "Other",
        ],
        message: "{VALUE} is not a supported language",
      },
    },
    format: {
      type: String,
      enum: {
        values: ["Paperback", "Hardcover", "E-book", "Audiobook"],
        message: "{VALUE} is not a supported format",
      },
      default: "Paperback",
    },
    publishDate: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || v <= new Date();
        },
        message: "Publish date cannot be in the future",
      },
    },
    publisher: {
      type: String,
      trim: true,
      maxlength: [100, "Publisher name cannot exceed 100 characters"],
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      validate: {
        validator: function (v) {
          return /^(https?:\/\/).+\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(v);
        },
        message: (props) => `${props.value} is not a valid image URL!`,
      },
    },
    images: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return /^(https?:\/\/).+\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(
              v
            );
          },
          message: (props) => `${props.value} is not a valid image URL!`,
        },
      },
    ],
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "Fiction",
          "Non-Fiction",
          "Science Fiction",
          "Fantasy",
          "Mystery",
          "Thriller",
          "Romance",
          "Historical Fiction",
          "Contemporary",
          "Young Adult",
          "Middle Grade",
          "Children's",
          "Biography & Autobiography",
          "History",
          "Science & Technology",
          "Mathematics",
          "Social Sciences",
          "Psychology",
          "Self-Help",
          "Business & Economics",
          "Travel",
          "Cookbooks, Food & Wine",
          "Art & Photography",
          "Religion & Spirituality",
          "Philosophy",
          "Poetry",
          "Drama",
          "Comics & Graphic Novels",
          "Education",
          "Reference",
        ],
        message: "{VALUE} is not a valid category",
      },
    },
    tags: [
      {
        type: String,
        maxlength: [30, "Tag cannot exceed 30 characters"],
        trim: true,
      },
    ],
    affiliateLink: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^(https?:\/\/)/.test(v);
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
    purchaseCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reviews: [reviewSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    wishlistCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    salesHistory: [salesHistorySchema],
    edition: {
      type: String,
      maxlength: [50, "Edition cannot exceed 50 characters"],
    },
    pageCount: {
      type: Number,
      min: [1, "Page count must be at least 1"],
    },
    dimensions: {
      height: Number,
      width: Number,
      thickness: Number,
    },
    weight: {
      type: Number,
      min: [0, "Weight cannot be negative"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
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

// Virtual for availability status
bookSchema.virtual("availability").get(function () {
  if (!this.isActive) return "Discontinued";
  if (this.inventory <= 0) return "Out of Stock";
  if (this.inventory < 10) return "Low Stock";
  return "In Stock";
});

// Check inventory before saving
bookSchema.pre("save", function (next) {
  if (this.isModified("inventory")) {
    if (this.inventory < 0) {
      throw new Error("Inventory cannot be negative");
    }
    // Automatically deactivate if inventory is 0
    if (this.inventory === 0 && this.isActive) {
      this.isActive = false;
    } else if (this.inventory > 0 && !this.isActive) {
      this.isActive = true;
    }
  }
  next();
});

// Static method to check stock availability
bookSchema.statics.checkStock = async function (bookId, quantity) {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    throw new Error("Invalid book ID");
  }

  const book = await this.findById(bookId);
  if (!book) throw new Error("Book not found");
  if (!book.isActive) throw new Error("Book is not available for purchase");
  if (book.inventory < quantity)
    throw new Error(`Only ${book.inventory} items available`);
  return book;
};

// Method to update inventory
bookSchema.methods.updateInventory = async function (quantity, orderId = null) {
  const newInventory = this.inventory + quantity;

  if (newInventory < 0) {
    throw new Error(
      `Cannot reduce inventory below 0. Current: ${this.inventory}, Attempted reduction: ${quantity}`
    );
  }

  this.inventory = newInventory;

  if (quantity < 0) {
    const absoluteQty = Math.abs(quantity);
    this.purchaseCount += absoluteQty;

    // Record sales history if this is a purchase
    this.salesHistory.push({
      quantity: absoluteQty,
      revenue: absoluteQty * this.price,
      orderId: orderId,
    });
  }

  // Update active status based on inventory
  this.isActive = newInventory > 0;

  return this.save();
};

// Method to increment views
bookSchema.methods.incrementViews = async function () {
  this.viewCount += 1;
  return this.save();
};

// Method to add a review
bookSchema.methods.addReview = async function (userId, rating, comment = "") {
  const existingReview = this.reviews.find((review) =>
    review.user.equals(userId)
  );

  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = comment;
  } else {
    this.reviews.push({
      user: userId,
      rating,
      comment,
    });
  }

  return this.save();
};

// Method to mark review as helpful
bookSchema.methods.markReviewHelpful = async function (reviewId) {
  const review = this.reviews.id(reviewId);
  if (!review) throw new Error("Review not found");

  review.helpfulVotes += 1;
  return this.save();
};

// Indexes
bookSchema.index({ title: "text", author: "text", description: "text" });
bookSchema.index({ category: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ averageRating: -1 });
bookSchema.index({ purchaseCount: -1 });
bookSchema.index({ isActive: 1 });
bookSchema.index({ "reviews.rating": 1 });
bookSchema.index({ "reviews.user": 1 });
bookSchema.index({ publishDate: -1 });

// Query helper for active books
bookSchema.query.active = function () {
  return this.where({ isActive: true });
};

// Query helper for books in category
bookSchema.query.inCategory = function (category) {
  return this.where({ category });
};

// Query helper for books with minimum rating
bookSchema.query.minRating = function (rating) {
  return this.where("averageRating").gte(rating);
};

module.exports = mongoose.model("Book", bookSchema);
