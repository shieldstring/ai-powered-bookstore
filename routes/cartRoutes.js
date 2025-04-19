const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { addToCart, removeFromCart, getCart } = require('../controllers/cartController');

const router = express.Router();

router.post('/add', protect, addToCart); // Add a book to the cart
router.delete('/remove/:bookId', protect, removeFromCart); // Remove a book from the cart
router.get('/', protect, getCart); // Get the user's cart

module.exports = router;