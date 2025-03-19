const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Refer a new user
const referUser = async (req, res) => {
  const { referralCode } = req.body;

  try {
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      return res.status(400).json({ message: 'Invalid referral code' });
    }

    const newUser = await User.create({ ...req.body, referredBy: referrer._id });

    // Add referral bonus to referrer
    referrer.earnings += 10; // Example: $10 bonus for each referral
    await referrer.save();

    // Log the transaction
    await Transaction.create({ user: referrer._id, amount: 10, type: 'referral', description: `Referral bonus for ${newUser.email}` });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user earnings
const getEarnings = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { referUser, getEarnings };