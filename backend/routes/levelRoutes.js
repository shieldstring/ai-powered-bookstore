const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { addXPForReading } = require('../controllers/levelController');

const router = express.Router();

router.post('/:userId/add-xp', protect, addXPForReading); // Add XP for reading a book

module.exports = router;