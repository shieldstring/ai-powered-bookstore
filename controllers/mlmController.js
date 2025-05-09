const User = require('../models/User');
const Transaction = require('../models/Transaction');
const MLMTier = require('../models/MLMTier');

/**
 * Add a new MLM tier (admin only)
 */
const addMLMTier = async (req, res) => {
  const { tier, name, commissionRate, minEarnings, benefits } = req.body;

  try {
    // Validate inputs
    if (!tier || tier < 0 || !commissionRate || !minEarnings) {
      return res.status(400).json({ 
        message: 'Please provide tier number, commission rate, and minimum earnings' 
      });
    }

    // Check if tier already exists
    const existingTier = await MLMTier.findOne({ tier });
    if (existingTier) {
      return res.status(400).json({ message: `Tier ${tier} already exists` });
    }

    // Create new tier
    const mlmTier = await MLMTier.create({ 
      tier, 
      name: name || `Tier ${tier}`, 
      commissionRate, 
      minEarnings,
      benefits: benefits || []
    });

    res.status(201).json(mlmTier);
  } catch (error) {
    console.error('Error adding MLM tier:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update an existing MLM tier (admin only)
 */
const updateMLMTier = async (req, res) => {
  const { id } = req.params;
  const { name, commissionRate, minEarnings, benefits } = req.body;

  try {
    const tier = await MLMTier.findById(id);
    if (!tier) {
      return res.status(404).json({ message: 'Tier not found' });
    }

    // Update fields
    if (name) tier.name = name;
    if (commissionRate !== undefined) tier.commissionRate = commissionRate;
    if (minEarnings !== undefined) tier.minEarnings = minEarnings;
    if (benefits) tier.benefits = benefits;

    await tier.save();

    // When minEarnings changes, we might need to update users' tiers
    if (minEarnings !== undefined) {
      // Queue a background job to update all users' tiers
      // This could be handled by a separate function or queue system
      updateAllUserTiers();
    }

    res.json(tier);
  } catch (error) {
    console.error('Error updating MLM tier:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get all MLM tiers
 */
const getAllMLMTiers = async (req, res) => {
  try {
    const tiers = await MLMTier.find().sort({ tier: 1 });
    res.json(tiers);
  } catch (error) {
    console.error('Error getting MLM tiers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete an MLM tier (admin only)
 */
const deleteMLMTier = async (req, res) => {
  const { id } = req.params;

  try {
    const tier = await MLMTier.findById(id);
    if (!tier) {
      return res.status(404).json({ message: 'Tier not found' });
    }

    await tier.remove();
    res.json({ message: 'Tier removed' });
  } catch (error) {
    console.error('Error deleting MLM tier:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get MLM system statistics (admin only)
 */
const getMLMStats = async (req, res) => {
  try {
    // Get overall statistics
    const totalUsers = await User.countDocuments();
    const usersInMLM = await User.countDocuments({ referredBy: { $exists: true, $ne: null } });
    const totalEarnings = await Transaction.aggregate([
      { $match: { type: { $in: ['referral', 'mlm_commission'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get tier distribution
    const tierDistribution = await User.aggregate([
      { $group: { _id: '$mlmTier', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Get top referrers
    const topReferrers = await User.find()
      .sort({ referralCount: -1 })
      .limit(10)
      .select('name email referralCount earnings mlmTier');
    
    // Get recent commissions
    const recentCommissions = await Transaction.find({ 
      type: { $in: ['referral', 'mlm_commission'] } 
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('user', 'name email')
      .populate('relatedUser', 'name email');
    
    res.json({
      totalUsers,
      usersInMLM,
      totalEarnings: totalEarnings[0]?.total || 0,
      tierDistribution,
      topReferrers,
      recentCommissions
    });
  } catch (error) {
    console.error('Error getting MLM stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update tiers for all users in the system
 * This should be used carefully as it can be resource-intensive
 */
const updateAllUserTiers = async () => {
  try {
    // Get all tiers sorted by tier level
    const mlmTiers = await MLMTier.find().sort({ tier: 1 });
    
    // Get all users with earnings
    const users = await User.find({ earnings: { $gt: 0 } });
    
    let updates = 0;
    
    // Update each user's tier based on their earnings
    for (const user of users) {
      let userTier = 0;
      
      for (const tier of mlmTiers) {
        if (user.earnings >= tier.minEarnings) {
          userTier = tier.tier;
        } else {
          break;
        }
      }
      
      // Update user tier if changed
      if (user.mlmTier !== userTier) {
        user.mlmTier = userTier;
        await user.save();
        updates++;
      }
    }
    
    console.log(`Updated tiers for ${updates} users`);
    return updates;
  } catch (error) {
    console.error('Error updating all user tiers:', error);
    throw error;
  }
};

/**
 * Manually recalculate a user's MLM tier (admin only)
 */
const recalculateUserTier = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const mlmTiers = await MLMTier.find().sort({ tier: 1 });
    let userTier = 0;
    
    for (const tier of mlmTiers) {
      if (user.earnings >= tier.minEarnings) {
        userTier = tier.tier;
      } else {
        break;
      }
    }
    
    // Update user tier if changed
    if (user.mlmTier !== userTier) {
      const oldTier = user.mlmTier;
      user.mlmTier = userTier;
      await user.save();
      
      res.json({ 
        message: `User tier updated from ${oldTier} to ${userTier}`,
        user: {
          _id: user._id,
          name: user.email,
          email: user.email,
          earnings: user.earnings,
          mlmTier: user.mlmTier
        }
      });
    } else {
      res.json({ 
        message: `User already at correct tier ${userTier}`,
        user: {
          _id: user._id,
          name: user.email,
          email: user.email,
          earnings: user.earnings,
          mlmTier: user.mlmTier
        }
      });
    }
  } catch (error) {
    console.error('Error recalculating user tier:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  addMLMTier,
  updateMLMTier,
  getAllMLMTiers,
  deleteMLMTier,
  getMLMStats,
  recalculateUserTier,
  updateAllUserTiers
};