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

// Route to trigger badge assignment for a user
const triggerBadgeAssignment = async (req, res) => {
  try {
    const userId = req.params.userId;
    await assignBadges(userId);
    res.status(200).json({ message: 'Badges checked and assigned successfully for user.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Route to get all badges
const getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find();
    res.status(200).json(badges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Route to create a new badge
const createBadge = async (req, res) => {
  try {
    const newBadge = await Badge.create(req.body);
    res.status(201).json(newBadge);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Route to get a specific badge by ID
const getBadgeById = async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }
    res.status(200).json(badge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Route to get all badges earned by a specific user
const getUserBadges = async (req, res) => {
  try {
    const userBadges = await UserBadge.find({ user: req.params.userId }).populate('badge');
    res.status(200).json(userBadges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  assignBadges,
  triggerBadgeAssignment,
  getAllBadges,
  createBadge,
  getBadgeById,
  getUserBadges
};