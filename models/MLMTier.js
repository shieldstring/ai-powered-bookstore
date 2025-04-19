const mongoose = require('mongoose');

const mlmTierSchema = mongoose.Schema(
  {
    tier: { type: Number, required: true }, // Tier level (1, 2, 3, etc.)
    commissionRate: { type: Number, required: true }, // Commission rate for this tier
    minEarnings: { type: Number, required: true }, // Minimum earnings required to reach this tier
  },
  { timestamps: true }
);

module.exports = mongoose.model('MLMTier', mlmTierSchema);