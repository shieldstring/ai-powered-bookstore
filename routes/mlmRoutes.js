const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { referUser, getEarnings, addMLMTier, calculateMLMTier, distributeCommissions } = require('../controllers/mlmController');

const router = express.Router();

router.post('/refer', protect, referUser);
router.get('/earnings', protect, getEarnings);

router.post('/tiers', protect, addMLMTier);
router.get('/tier', protect, calculateMLMTier);
router.post('/distribute', protect, distributeCommissions);
module.exports = router;