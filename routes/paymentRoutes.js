const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { 
  createCheckoutSession, 
  getCheckoutStatus, 
  handleWebhook
} = require('../controllers/paymentController');
const router = express.Router();

// Protected routes (require authentication)
router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/checkout-status/:sessionId', protect, getCheckoutStatus);

// Webhook doesn't need protection as it's called by Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;