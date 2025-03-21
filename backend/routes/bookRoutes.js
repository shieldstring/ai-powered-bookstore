const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const { getBooks, addBook, editBook, deleteBook, trackPurchase, addReview, getBookById, getRecommendations, searchBooks, updateInventory, bulkDeleteBooks, bulkUpdateInventory } = require('../controllers/bookController');

const router = express.Router();

router.get('/', getBooks);
router.get('/:id', getBookById);
router.get('/recommendations', protect, getRecommendations);
router.get('/search', searchBooks);
router.post('/', protect, admin, addBook);
router.put('/:id', protect, admin, editBook);
router.delete('/:id', protect, admin, deleteBook);
router.post('/:id/purchase', protect, trackPurchase);
router.post('/:id/reviews', protect, addReview);
router.put('/:id/inventory', protect, admin, updateInventory); // Update book inventory
router.delete('/books/bulk-delete', protect, admin, bulkDeleteBooks);
router.put('/books/bulk-update-inventory', protect, admin, bulkUpdateInventory);

module.exports = router;