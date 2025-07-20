const mongoose = require("mongoose");
const Seller = require("../models/Seller");

const findSellerByIdOrSlug = async (identifier) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(identifier);

  const query = isObjectId ? { _id: identifier } : { slug: identifier };

  return await Seller.findOne(query).populate("user", "email name");
};

module.exports = findSellerByIdOrSlug;
