const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createChallenge, joinChallenge, completeChallenge } = require('../controllers/challengeController');

const router = express.Router();

router.post('/', protect, createChallenge);
router.post('/join', protect, joinChallenge);
router.post('/complete', protect, completeChallenge);

module.exports = router;