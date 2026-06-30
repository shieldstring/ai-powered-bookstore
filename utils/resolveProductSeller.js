const mongoose = require("mongoose");
const User = require("../models/User");

const PLATFORM_SELLER_EMAILS = [
  "platformseller@example.com",
  "contact@wisdompeters.com",
];

/**
 * Resolve which user ID should be stored as `seller` on a book/course.
 * Sellers use their own account; admins use an explicit seller id or the platform seller.
 */
const resolveProductSeller = async (req) => {
  if (req.user.role === "seller") {
    return req.user._id;
  }

  if (
    req.body.seller &&
    mongoose.Types.ObjectId.isValid(req.body.seller)
  ) {
    return req.body.seller;
  }

  for (const email of PLATFORM_SELLER_EMAILS) {
    const user = await User.findOne({ email });
    if (user) return user._id;
  }

  const platformSeller = await User.findOne({ role: "seller" }).sort({
    createdAt: 1,
  });
  if (platformSeller) return platformSeller._id;

  return req.user._id;
};

module.exports = { resolveProductSeller };
