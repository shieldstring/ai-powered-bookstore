const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const { 
  triggerBadgeAssignment,
  getAllBadges,
  createBadge,
  getBadgeById,
  getUserBadges
} = require('../controllers/badgeController');

const router = express.Router();

// Route to trigger badge assignment for a user
router.post('/assign/:userId', protect, triggerBadgeAssignment);

// Route to get all badges (admin only)
router.get('/', protect, admin, getAllBadges);

// Route to create a new badge (admin only)
router.post('/', protect, admin, createBadge);

// Route to get a specific badge by ID (publicly accessible)
router.get('/:id', getBadgeById);

// Route to get all badges earned by a specific user (protected)
router.get('/user/:userId', protect, getUserBadges);

module.exports = router;