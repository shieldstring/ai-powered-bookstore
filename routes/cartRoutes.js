const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  addToCart,
  removeFromCart,
  getCart,
  updateCartItem,
  clearCart,
  applyCoupon
} = require('../controllers/cartController');

const router = express.Router();

// Add a book to the cart
router.post('/add', protect, addToCart);

// Update quantity of a book in the cart
router.put('/update/:bookId', protect, updateCartItem);

// Remove a book from the cart
router.delete('/remove/:bookId', protect, removeFromCart);

// Clear the entire cart
router.delete('/clear', protect, clearCart);

// Apply coupon to cart
router.post('/apply-coupon', protect, applyCoupon);

// Get the user's cart
router.get('/', protect, getCart);

module.exports = router;