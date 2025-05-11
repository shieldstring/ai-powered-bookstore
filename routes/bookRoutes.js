const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getBooks,
  addBook,
  updateBook,
  deleteBook,
  trackPurchase,
  addReview,
  getBookById,
  getRecommendations,
  bulkUpdateInventory,
} = require("../controllers/bookController");

const router = express.Router();

router.get("/", getBooks);
router.get("/:id", getBookById); // Get a single book by ID
router.get("/recommendations", protect, getRecommendations); // Get AI-curated recommendations
router.post("/", protect, admin, addBook); // Only admins can add books
router.put("/:id", protect, admin, updateBook); // Only admins can edit books
router.delete("/:id", protect, admin, deleteBook); // Only admins can delete books
router.post("/:id/purchase", protect, trackPurchase);
router.post("/:id/reviews", protect, addReview); // Add a review to a book
router.put("/books/bulk-update-inventory", protect, admin, bulkUpdateInventory);

module.exports = router;
