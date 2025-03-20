const express = require('express');
const { registerUser, loginUser, forgotPassword, resetPassword, updateProfile } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/profile', protect, updateProfile); // Update user profile

module.exports = router;