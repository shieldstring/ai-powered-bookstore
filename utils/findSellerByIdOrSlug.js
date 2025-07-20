const mongoose = require("mongoose");
const User = require("../models/User");
const Seller = require("../models/Seller");

const findSellerByIdOrSlug = async (identifier) => {
  let userQuery = { role: "seller" };

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    userQuery._id = identifier;
  } else {
    userQuery.slug = identifier; // Ensure User model has this field!
  }

  const user = await User.findOne(userQuery).select("name email slug role");
  if (!user) return null;

  const sellerProfile = await Seller.findOne({ user: user._id });
  if (!sellerProfile) return null;

  return { user, sellerProfile };
};

module.exports = findSellerByIdOrSlug;
