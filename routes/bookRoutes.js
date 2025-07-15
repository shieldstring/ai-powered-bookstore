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
  getSellerBooks,
} = require("../controllers/bookController");

const router = express.Router();

// Public routes
router.get("/", getBooks);
router.get("/recommendations", protect, getRecommendations);
router.get("/:id", getBookById);

// Seller route to view own listings
router.get("/my-books", protect, getSellerBooks);

// Shared routes for seller and admin
router.post("/", protect, addBook);
router.put("/:id", protect, updateBook);
router.delete("/:id", protect, deleteBook);

// Additional functionalities
router.post("/:id/purchase", protect, trackPurchase);
router.post("/:id/reviews", protect, addReview);
router.put("/books/bulk-update-inventory", protect, admin, bulkUpdateInventory);

module.exports = router;
