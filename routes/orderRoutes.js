const express = require("express");
const { protect, admin, sellerOnly } = require("../middleware/authMiddleware");
const {
  createOrder,
  getOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  verifyPayment,
  getOrderStatusSummary,
} = require("../controllers/orderController");

const router = express.Router();

// Create order
router.post("/", protect, createOrder);

// User orders
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);

// Verify payment
router.post("/verify-payment", protect, verifyPayment);

// Admin & Seller shared access routes
router.get("/admin/all", protect, admin, getAllOrders);
router.get("/seller/all", protect, sellerOnly, getAllOrders);

// Update order item status (Admin & Seller)
router.put("/:orderId/item/:bookId/status", protect, updateOrderStatus);

// Cancel order or items (Admin & Seller)
router.put("/:orderId/cancel", protect, cancelOrder);

// Delete order (Admin & Seller)
router.delete("/:orderId", protect, deleteOrder);

// Get order status summary
router.get("/:orderId/summary", protect, getOrderStatusSummary);

module.exports = router;