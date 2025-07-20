const mongoose = require("mongoose");
const User = require("../models/User");
const Seller = require("../models/Seller");

const findSellerByIdOrSlug = async (identifier) => {
  let user;

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    user = await User.findById(identifier).select("name email role");
  } else {
    user = await User.findOne({ slug: identifier }).select("name email role");
  }

  if (!user || user.role !== "seller") return null;

  const sellerProfile = await Seller.findOne({ user: user._id });

  return {
    user,
    sellerProfile,
  };
};

module.exports = findSellerByIdOrSlug;
