const User = require('../models/User');

// Add XP and level up
const addXP = async (userId, xp) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  user.xp += xp;

  // Level up logic (e.g., 100 XP per level)
  if (user.xp >= 100 * user.level) {
    user.level += 1;
    user.xp = 0; // Reset XP after leveling up
  }

  await user.save();
};

// Example: Add XP for reading a book
const addXPForReading = async (req, res) => {
  const { userId } = req.params;
  const xp = 10; // XP for reading a book

  try {
    await addXP(userId, xp);
    res.json({ message: 'XP added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addXPForReading };