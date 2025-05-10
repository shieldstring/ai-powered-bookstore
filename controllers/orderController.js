const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Book = require("../models/Book");
const Transaction = require("../models/Transaction");

// Create a new order
const createOrder = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    totalPrice,
    paymentResult,
  } = req.body;

  try {
    // Create the order
    const order = await Order.create({
      user: req.user._id,
      orderItems: orderItems.map((item) => ({
        book: item._id,
        name: item.name,
        quantity: item.quantity,
        image: item.image,
        price: item.price,
      })),
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice: req.body.taxPrice || 0,
      shippingPrice: req.body.shippingPrice || 0,
      totalPrice,
      isPaid: false,
      status: "pending",
    });

    // If there's a payment result with an ID (from Stripe), update the transaction
    if (
      paymentResult &&
      paymentResult.id &&
      paymentResult.id !== "simulated_payment_id"
    ) {
      const transaction = await Transaction.findOne({
        paymentIntentId: paymentResult.id,
      });
      if (transaction) {
        transaction.orderId = order._id;
        await transaction.save();
      }
    }

    // Clear the user's cart in the database if they have one
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } }
    );

    res.status(201).json(order);
  } catch (error) {
    console.error("Order creation error:", error);
    res
      .status(500)
      .json({ message: error.message || "Server error creating order" });
  }
};

// Update order payment status
const updateOrderPaymentStatus = async (req, res) => {
  const { orderId } = req.params;
  const { paymentData } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only the order owner or admin can update
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: paymentData.id,
      status: paymentData.status,
      update_time: new Date().toISOString(),
      email_address: paymentData.email_address || req.user.email,
    };

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    console.error("Payment status update error:", error);
    res.status(500).json({ message: "Server error updating payment status" });
  }
};

// Get all orders for the user
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate(
      "items.book"
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single order by ID
const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id).populate("items.book");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure the user can only access their own orders
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.book")
      .populate("user", "name email");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Cancel an order (admin only)
const cancelOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow canceling orders that are not already completed or canceled
    if (order.status === "delivered" || order.status === "canceled") {
      return res.status(400).json({ message: "Order cannot be canceled" });
    }

    order.status = "canceled";
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete an order (admin only)
const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await Order.findByIdAndDelete(id);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
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
  updateOrderPaymentStatus,
};
