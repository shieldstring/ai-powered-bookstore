const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createReadingList } = require('../controllers/readingListController');

const router = express.Router();

router.post('/', protect, createReadingList); // Create a reading list

module.exports = router;