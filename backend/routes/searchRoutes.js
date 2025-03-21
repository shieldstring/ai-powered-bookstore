const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { search } = require('../controllers/searchController');

const router = express.Router();

router.get('/', protect, search); // Global search

module.exports = router;