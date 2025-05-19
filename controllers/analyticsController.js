const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');

// Get comprehensive dashboard analytics
const getDashboardStats = async (req, res) => {
  try {
    // Calculate active users (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } });
    const totalUsers = await User.countDocuments();
    
    // Calculate sales data
    const totalSales = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } }
    ]);
    
    // Get monthly sales data
    const monthlySales = await Order.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    // Get top earners
    const topEarners = await User.find({ earnings: { $gt: 0 } })
      .sort({ earnings: -1 })
      .limit(5)
      .select('name email earnings');
    
    // Get popular books
    const popularBooks = await Book.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'books.book',
          as: 'orders'
        }
      },
      {
        $project: {
          title: 1,
          coverImage: 1,
          salesCount: { $size: '$orders' }
        }
      },
      { $sort: { salesCount: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      userStats: { activeUsers, totalUsers },
      salesStats: {
        totalRevenue: totalSales[0]?.total || 0,
        totalOrders: totalSales[0]?.count || 0
      },
      monthlySales,
      topEarners,
      popularBooks
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get detailed sales analytics with filters
const getSalesAnalytics = async (req, res) => {
  try {
    const { period = 'monthly', year = new Date().getFullYear() } = req.query;
    
    let groupBy, dateFormat;
    
    switch (period) {
      case 'daily':
        groupBy = { $dayOfMonth: '$createdAt' };
        dateFormat = 'day';
        break;
      case 'weekly':
        groupBy = { $week: '$createdAt' };
        dateFormat = 'week';
        break;
      case 'monthly':
      default:
        groupBy = { $month: '$createdAt' };
        dateFormat = 'month';
    }
    
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalPrice' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({ period, year, dateFormat, data: salesData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDashboardStats, getSalesAnalytics };