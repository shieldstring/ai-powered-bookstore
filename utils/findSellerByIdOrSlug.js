const mongoose = require("mongoose");
const Seller = require("../models/Seller");

const findSellerByIdOrSlug = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return await Seller.findById(identifier).populate("user", "email name");
  }
  return await Seller.findOne({ slug: identifier }).populate(
    "user",
    "email name"
  );
};

module.exports = findSellerByIdOrSlug;
