const UserBadge = require('../models/UserBadge');
const Badge = require('../models/Badge');
const User = require('../models/User');

// Check and assign badges
const assignBadges = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const badges = await Badge.find();
  for (const badge of badges) {
    const hasBadge = await UserBadge.findOne({ user: userId, badge: badge._id });
    if (!hasBadge) {
      // Check criteria (e.g., "Read 50 Books")
      if (badge.criteria === 'Read 50 Books' && user.booksRead >= 50) {
        await UserBadge.create({ user: userId, badge: badge._id });
      }
    }
  }
};

module.exports = { assignBadges };