const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createOrder,
  getOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
} = require('../controllers/orderController');

const router = express.Router();

router.post('/', protect, createOrder); // Create a new order
router.get('/', protect, getOrders); // Get all orders for the user
router.get('/:id', protect, getOrderById); // Get a single order by ID
router.get('/admin/all', protect, admin, getAllOrders); // Get all orders (admin only)
router.put('/:id/status', protect, admin, updateOrderStatus); // Update order status (admin only)
router.put('/:id/cancel', protect, admin, cancelOrder); // Cancel an order (admin only)
router.delete('/:id', protect, admin, deleteOrder); // Delete an order (admin only)

module.exports = router;