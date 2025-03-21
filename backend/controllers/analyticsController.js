const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');

// Get user engagement analytics
const getUserEngagement = async (req, res) => {
  try {
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
    const totalUsers = await User.countDocuments();
    res.json({ activeUsers, totalUsers });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get book sales analytics
const getBookSales = async (req, res) => {
  try {
    const totalSales = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]);
    res.json({ totalSales: totalSales[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get MLM performance analytics
const getMLMPerformance = async (req, res) => {
  try {
    const topEarners = await User.find().sort({ earnings: -1 }).limit(10);
    res.json(topEarners);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUserEngagement, getBookSales, getMLMPerformance };