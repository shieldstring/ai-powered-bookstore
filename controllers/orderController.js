const mongoose = require("mongoose");
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

  // Validate required fields
  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: "No order items" });
  }

  try {
    // Check stock availability
    for (const item of orderItems) {
      // Use bookId or id as they appear in the request
      const bookId = item.bookId || item.id;

      if (!bookId) {
        return res
          .status(400)
          .json({ message: "Missing book ID in order items" });
      }

      const book = await Book.findById(bookId);

      if (!book) {
        return res.status(404).json({ message: `Book ${bookId} not found` });
      }

      if (book.countInStock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${book.name}`,
        });
      }
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Fetch book details for each order item to include in order
      const enhancedOrderItems = [];

      for (const item of orderItems) {
        const bookId = item.book;

        if (!bookId) {
          return res
            .status(400)
            .json({ message: "Missing book ID in order items" });
        }

        const book = await Book.findById(bookId).lean();

        if (!book) {
          return res.status(404).json({ message: `Book ${bookId} not found` });
        }

        enhancedOrderItems.push({
          book: bookId,
          name: book.name,
          quantity: item.quantity,
          image: book.image || "",
          price: book.price || 0,
        });
      }

      // Create the order with enhanced details
      const order = await Order.create(
        [
          {
            user: req.user._id,
            orderItems: enhancedOrderItems,
            shippingAddress,
            paymentMethod,
            paymentResult: paymentResult || {},
            itemsPrice: itemsPrice || totalPrice, // Using itemsPrice as it's in your model
            taxPrice: req.body.taxPrice || 0,
            shippingPrice: req.body.shippingPrice || 0,
            totalPrice,
            isPaid: false,
            status: "pending",
          },
        ],
        { session }
      );

      // Update book quantities
      for (const item of orderItems) {
        const bookId = item.book;

        await Book.findByIdAndUpdate(
          bookId,
          { $inc: { countInStock: -item.quantity } },
          { session }
        );
      }

      // Handle payment transaction if exists
      if (paymentResult?.id && paymentResult.id !== "simulated_payment_id") {
        await Transaction.findOneAndUpdate(
          { paymentIntentId: paymentResult.id },
          { orderId: order[0]._id },
          { session }
        );
      }

      // Clear cart
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $set: { items: [] } },
        { session }
      );

      await session.commitTransaction();
      res.status(201).json(order[0]);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      message: error.message || "Server error creating order",
    });
  }
};

// Update order payment status
const updateOrderPaymentStatus = async (req, res) => {
  const { orderId } = req.params;
  const { paymentData } = req.body;

  if (!paymentData?.id || !paymentData?.status) {
    return res.status(400).json({ message: "Invalid payment data" });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Authorization check
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Prevent duplicate payment updates
    if (order.isPaid) {
      return res.status(400).json({ message: "Order is already paid" });
    }

    const update = {
      isPaid: true,
      paidAt: Date.now(),
      paymentResult: {
        id: paymentData.id,
        status: paymentData.status,
        update_time: new Date().toISOString(),
        email_address: paymentData.email_address || req.user.email,
      },
      status: "processing", // Move to next status after payment
    };

    const updatedOrder = await Order.findByIdAndUpdate(orderId, update, {
      new: true,
      runValidators: true,
    }).populate("orderItems.book");

    res.json(updatedOrder);
  } catch (error) {
    console.error("Payment status update error:", error);
    res.status(500).json({
      message: error.message || "Server error updating payment status",
    });
  }
};

// Get all orders for the user
const getOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.book")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments({ user: req.user._id });

    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      message: error.message || "Server error fetching orders",
    });
  }
};

// Get a single order by ID
const getOrderById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  try {
    const order = await Order.findById(id)
      .populate("orderItems.book")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Authorization check
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({
      message: error.message || "Server error fetching order",
    });
  }
};

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    sortField = "createdAt",
    sortOrder = "desc",
  } = req.query;

  try {
    const filter = {};
    if (status) filter.status = status;

    const sort = {};
    sort[sortField] = sortOrder === "desc" ? -1 : 1;

    const orders = await Order.find(filter)
      .populate("orderItems.book")
      .populate("user", "name email")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments(filter);

    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalOrders: count,
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      message: error.message || "Server error fetching orders",
    });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "canceled",
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Validate status transition
    if (order.status === "canceled" && status !== "canceled") {
      return res
        .status(400)
        .json({ message: "Canceled orders cannot be updated" });
    }

    if (order.status === "delivered" && status !== "delivered") {
      return res
        .status(400)
        .json({ message: "Delivered orders cannot be updated" });
    }

    order.status = status;

    // Update deliveredAt if status is delivered
    if (status === "delivered") {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      message: error.message || "Server error updating order status",
    });
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

    if (order.status === "delivered") {
      return res
        .status(400)
        .json({ message: "Delivered orders cannot be canceled" });
    }

    if (order.status === "canceled") {
      return res.status(400).json({ message: "Order is already canceled" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Restore inventory
      for (const item of order.orderItems) {
        await Book.findByIdAndUpdate(
          item.book,
          { $inc: { countInStock: item.quantity } },
          { session }
        );
      }

      order.status = "canceled";
      const updatedOrder = await order.save({ session });

      await session.commitTransaction();
      res.json(updatedOrder);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      message: error.message || "Server error canceling order",
    });
  }
};

// Delete an order (admin only)
const deleteOrder = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Prevent deletion of orders that are processing or shipped
    if (["processing", "shipped"].includes(order.status)) {
      return res.status(400).json({
        message: "Cannot delete order with current status",
      });
    }

    await Order.findByIdAndDelete(id);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({
      message: error.message || "Server error deleting order",
    });
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
