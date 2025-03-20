const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getBooks, addBook, editBook, deleteBook, trackPurchase, addReview, getBookById } = require('../controllers/bookController');

const router = express.Router();

router.get('/', getBooks);
router.get('/:id', getBookById); // Get a single book by ID
router.post('/', protect, addBook);
router.put('/:id', protect, editBook);
router.delete('/:id', protect, deleteBook);
router.post('/:id/purchase', protect, trackPurchase);
router.post('/:id/reviews', protect, addReview);

module.exports = router;