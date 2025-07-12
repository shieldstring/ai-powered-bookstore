const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  storeName: { type: String, required: true },
  banner: String,
  logo: String,
  bio: String,

  // Optional reverse reference
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  analytics: {
    totalRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Seller", sellerSchema);
