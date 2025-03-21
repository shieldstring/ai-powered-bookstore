const User = require('../models/User');

// Get top earners
const getTopEarners = async (req, res) => {
  try {
    const topEarners = await User.find().sort({ earnings: -1 }).limit(10);
    res.json(topEarners);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get top readers (based on tokens earned)
const getTopReaders = async (req, res) => {
  try {
    const topReaders = await User.find().sort({ tokens: -1 }).limit(10);
    res.json(topReaders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getTopEarners, getTopReaders };