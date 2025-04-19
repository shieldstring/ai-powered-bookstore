const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { sendMessage, getMessages } = require('../controllers/messageController');

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/:userId', protect, getMessages);

module.exports = router;