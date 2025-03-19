const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getBooks, addBook, editBook, deleteBook, trackPurchase } = require('../controllers/bookController');

const router = express.Router();

router.get('/', getBooks);
router.post('/', protect, addBook);
router.put('/:id', protect, editBook);
router.delete('/:id', protect, deleteBook);
router.post('/:id/purchase', protect, trackPurchase); // Track a book purchase

module.exports = router;