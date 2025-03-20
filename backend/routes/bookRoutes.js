const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getBooks, addBook, editBook, deleteBook, trackPurchase, addReview } = require('../controllers/bookController');

const router = express.Router();

router.get('/', getBooks);
router.post('/', protect, addBook);
router.put('/:id', protect, editBook);
router.delete('/:id', protect, deleteBook);
router.post('/:id/purchase', protect, trackPurchase);
router.post('/:id/reviews', protect, addReview); // Add a review to a book

module.exports = router;