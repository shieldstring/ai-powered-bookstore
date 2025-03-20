const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const { getBooks, addBook, editBook, deleteBook, trackPurchase, addReview, getBookById, getRecommendations, searchBooks } = require('../controllers/bookController');

const router = express.Router();

router.get('/', getBooks);
router.get('/:id', getBookById);
router.get('/recommendations', protect, getRecommendations);
router.get('/search', searchBooks);
router.post('/', protect, admin, addBook); // Only admins can add books
router.put('/:id', protect, admin, editBook); // Only admins can edit books
router.delete('/:id', protect, admin, deleteBook); // Only admins can delete books
router.post('/:id/purchase', protect, trackPurchase);
router.post('/:id/reviews', protect, addReview);

module.exports = router;