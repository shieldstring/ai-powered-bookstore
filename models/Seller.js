const mongoose = require("mongoose");
const slugify = require("slugify");
const shortid = require("shortid");

const sellerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    storeName: { type: String, required: true },
    slug: { type: String },

    banner: String,
    logo: String,
    bio: String,

    contactEmail: String,
    contactPhone: String,
    address: String,

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },

    payoutDetails: {
      bankName: String,
      accountNumber: String,
      accountName: String,
    },

    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],

    analytics: {
      totalRevenue: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalProducts: { type: Number, default: 0 },
    },

    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/// Unique slug generation with fallback shortid to avoid duplicate errors
sellerSchema.pre("save", function (next) {
  if (!this.isModified("storeName")) return next();

  const baseSlug = slugify(this.storeName, { lower: true, strict: true });
  const randomId = shortid.generate().slice(0, 6);

  this.slug = `${baseSlug}-${randomId}`;
  next();
});

/// Virtual field for dynamic book count
sellerSchema.virtual("bookCount", {
  ref: "Book",
  localField: "_id",
  foreignField: "seller",
  count: true,
});

/// --- Indexes ---
sellerSchema.index({ slug: 1 }, { unique: true }); 
sellerSchema.index({ status: 1 });

module.exports = mongoose.model("Seller", sellerSchema);
