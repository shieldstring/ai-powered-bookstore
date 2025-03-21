const mongoose = require('mongoose');

const challengeSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    reward: { type: Number, required: true }, // Tokens rewarded for completing the challenge
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Challenge', challengeSchema);