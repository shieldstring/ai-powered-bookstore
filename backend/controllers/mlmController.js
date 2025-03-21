const User = require('../models/User');
const Transaction = require('../models/Transaction');
const MLMTier = require('../models/MLMTier');

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


// Add MLM tiers (admin-only)
const addMLMTier = async (req, res) => {
  const { tier, commissionRate, minEarnings } = req.body;

  try {
    const mlmTier = await MLMTier.create({ tier, commissionRate, minEarnings });
    res.status(201).json(mlmTier);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Calculate user's MLM tier based on earnings
const calculateMLMTier = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const mlmTiers = await MLMTier.find().sort({ tier: 1 });

    let userTier = 0;
    for (const tier of mlmTiers) {
      if (user.earnings >= tier.minEarnings) {
        userTier = tier.tier;
      } else {
        break;
      }
    }

    res.json({ tier: userTier });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Distribute MLM commissions
const distributeCommissions = async (req, res) => {
  const { userId, amount } = req.body;

  try {
    const user = await User.findById(userId);
    const referrer = await User.findById(user.referredBy);

    if (referrer) {
      const mlmTiers = await MLMTier.find().sort({ tier: 1 });

      let commissionRate = 0;
      for (const tier of mlmTiers) {
        if (referrer.earnings >= tier.minEarnings) {
          commissionRate = tier.commissionRate;
        } else {
          break;
        }
      }

      const commission = amount * (commissionRate / 100);
      referrer.earnings += commission;
      await referrer.save();

      // Log the transaction
      await Transaction.create({ user: referrer._id, amount: commission, type: 'commission', description: `MLM commission for ${user.email}` });
    }

    res.json({ message: 'Commissions distributed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { referUser, getEarnings,addMLMTier, calculateMLMTier, distributeCommissions };