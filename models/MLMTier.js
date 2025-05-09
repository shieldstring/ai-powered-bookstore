const mongoose = require("mongoose");

const mlmTierSchema = mongoose.Schema(
  {
    tier: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    commissionRate: {
      type: Number,
      required: true,
    },
    minEarnings: {
      type: Number,
      required: true,
    },
    benefits: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("MLMTier", mlmTierSchema);
