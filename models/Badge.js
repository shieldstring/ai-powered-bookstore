const mongoose = require('mongoose');

const badgeSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    criteria: { type: String, required: true }, // Criteria for earning the badge (e.g., "Read 50 Books")
  },
  { timestamps: true }
);

module.exports = mongoose.model('Badge', badgeSchema);