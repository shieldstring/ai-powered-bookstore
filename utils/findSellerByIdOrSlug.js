const mongoose = require("mongoose");
const User = require("../models/User");
const Seller = require("../models/Seller");

const findSellerByIdOrSlug = async (identifier) => {
  let user = null;
  let sellerProfile = null;

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    user = await User.findById(identifier).select("name email role slug");
    if (user && user.role === "seller") {
      sellerProfile = await Seller.findOne({ user: user._id });
      return { user, sellerProfile };
    }
  } else {
    // Try User.slug first
    user = await User.findOne({ slug: identifier }).select("name email role slug");
    if (user && user.role === "seller") {
      sellerProfile = await Seller.findOne({ user: user._id });
      return { user, sellerProfile };
    }

    // If not found in User, check Seller slug
    sellerProfile = await Seller.findOne({ slug: identifier }).populate("user", "name email role slug");
    if (sellerProfile && sellerProfile.user.role === "seller") {
      return { user: sellerProfile.user, sellerProfile };
    }
  }

  return null; // Not found
};

module.exports = findSellerByIdOrSlug;
