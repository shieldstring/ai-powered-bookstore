const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const { getDashboardStats, getSalesAnalytics } = require('../controllers/analyticsController');

const router = express.Router();

// Main dashboard stats
router.get('/dashboard', protect, admin, getDashboardStats);

// Detailed sales analytics with filters
router.get('/sales', protect, admin, getSalesAnalytics);

module.exports = router;