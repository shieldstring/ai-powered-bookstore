const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getBooks, addBook, editBook, deleteBook, trackPurchase, addReview, getBookById, getRecommendations, searchBooks } = require('../controllers/bookController');

const router = express.Router();

router.get('/', getBooks);
router.get('/:id', getBookById);
router.get('/recommendations', protect, getRecommendations); // Get AI-curated recommendations
router.get('/search', searchBooks); // Search books manually
router.post('/', protect, addBook);
router.put('/:id', protect, editBook);
router.delete('/:id', protect, deleteBook);
router.post('/:id/purchase', protect, trackPurchase);
router.post('/:id/reviews', protect, addReview);

module.exports = router;