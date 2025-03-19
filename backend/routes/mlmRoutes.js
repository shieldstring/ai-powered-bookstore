const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { referUser, getEarnings } = require('../controllers/mlmController');

const router = express.Router();

router.post('/refer', protect, referUser);
router.get('/earnings', protect, getEarnings);

module.exports = router;