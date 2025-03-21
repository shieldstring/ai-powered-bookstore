const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const { getUserEngagement, getBookSales, getMLMPerformance } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/user-engagement', protect, admin, getUserEngagement);
router.get('/book-sales', protect, admin, getBookSales);
router.get('/mlm-performance', protect, admin, getMLMPerformance);

module.exports = router;