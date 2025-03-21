const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');

// Create a new order from the user's cart
const createOrder = async (req, res) => {
  const { paymentMethod, shippingAddress } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total price
    const totalPrice = cart.items.reduce((total, item) => total + item.book.price * item.quantity, 0);

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: cart.items.map((item) => ({
        book: item.book._id,
        quantity: item.quantity,
        price: item.book.price,
      })),
      totalPrice,
      paymentMethod,
      shippingAddress,
      status: 'pending', // Default status
    });

    // Clear the cart
    await Cart.findByIdAndDelete(cart._id);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all orders for the user
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('items.book');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single order by ID
const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id).populate('items.book');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure the user can only access their own orders
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('items.book').populate('user', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel an order (admin only)
const cancelOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow canceling orders that are not already completed or canceled
    if (order.status === 'delivered' || order.status === 'canceled') {
      return res.status(400).json({ message: 'Order cannot be canceled' });
    }

    order.status = 'canceled';
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an order (admin only)
const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await Order.findByIdAndDelete(id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
};