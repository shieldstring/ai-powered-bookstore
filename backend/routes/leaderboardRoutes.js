const express = require('express');
const { getTopEarners, getTopReaders } = require('../controllers/leaderboardController');

const router = express.Router();

router.get('/top-earners', getTopEarners);
router.get('/top-readers', getTopReaders);

module.exports = router;