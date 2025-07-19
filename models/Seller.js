const mongoose = require("mongoose");
const slugify = require("slugify");
const Book = require("../models/Book"); 

const sellerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    storeName: { type: String, required: true },
    slug: { type: String, unique: true },

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
      totalProducts: { type: Number, default: 0 }, // Optional if you use virtual below
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

sellerSchema.pre("save", function (next) {
  if (!this.isModified("storeName")) return next();

  this.slug = slugify(this.storeName, { lower: true, strict: true });
  next();
});

sellerSchema.virtual("bookCount", {
  ref: "Book",
  localField: "_id",
  foreignField: "seller",
  count: true,
});

sellerSchema.index({ slug: 1 });
sellerSchema.index({ status: 1 });

module.exports = mongoose.model("Seller", sellerSchema);
