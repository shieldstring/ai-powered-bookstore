const mongoose = require("mongoose");
const Seller = require("../models/Seller");

const findSellerByIdOrSlug = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    // Try as Seller ID first
    let seller = await Seller.findById(identifier).populate(
      "user",
      "email name"
    );
    if (seller) return seller;

    // Then try as User ID
    seller = await Seller.findOne({ user: identifier }).populate(
      "user",
      "email name"
    );
    if (seller) return seller;
  }

  // Try as slug last
  return await Seller.findOne({ slug: identifier }).populate(
    "user",
    "email name"
  );
};

module.exports = findSellerByIdOrSlug;
