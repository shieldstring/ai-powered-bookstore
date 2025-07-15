const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Book = require("../models/Book");
const Transaction = require("../models/Transaction");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Helpers
const isAdminOrSeller = (user) =>
  user.role === "admin" || user.role === "seller";

const getOrderOrFail = async (id) => {
  const order = await Order.findById(id);
  if (!order) throw new Error("Order not found");
  return order;
};

const validateStatusTransition = (current, next) => {
  const rules = {
    pending: ["processing", "canceled"],
    processing: ["shipped", "canceled"],
    shipped: ["delivered"],
    delivered: [],
    canceled: [],
  };
  return rules[current]?.includes(next);
};

// Create Order
const createOrder = async (req, res) => {
  const { orderItems, paymentResult } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: "No order items" });
  }

  try {
    const enhancedItems = await Promise.all(
      orderItems.map(async (item) => {
        const book = await Book.findById(item.book).lean();
        if (!book) throw new Error(`Book ${item.book} not found`);
        if (book.countInStock < item.quantity) {
          throw new Error(`Insufficient stock for ${book.name}`);
        }

        return {
          book: item.book,
          seller: book.seller || null,
          name: book.name,
          image: book.image,
          price: book.price,
          quantity: item.quantity,
          sellerStatus: "pending",
          statusUpdatedAt: new Date(),
        };
      })
    );

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = new Order({
        ...req.body,
        orderItems: enhancedItems,
        user: req.user._id,
        status: "pending",
      });

      const savedOrder = await order.save({ session });

      for (const item of orderItems) {
        await Book.findByIdAndUpdate(
          item.book,
          { $inc: { countInStock: -item.quantity } },
          { session }
        );
      }

      if (paymentResult?.id && paymentResult.id !== "simulated_payment_id") {
        await Transaction.findOneAndUpdate(
          { paymentIntentId: paymentResult.id },
          { orderId: savedOrder._id },
          { session }
        );
      }

      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $set: { items: [] } },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      res.status(201).json(savedOrder);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get User Orders
const getOrders = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  try {
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate("orderItems.book")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments(filter);

    res.json({
      orders,
      totalOrders: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Single Order
const getOrderById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  try {
    const order = await Order.findById(id)
      .populate("orderItems.book")
      .populate("user", "name email");

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Orders (Admin & Seller)
const getAllOrders = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  try {
    let orders, totalCount;

    if (req.user.role === "admin") {
      const filter = status ? { status } : {};
      orders = await Order.find(filter)
        .populate("user", "name email")
        .populate("orderItems.book")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      totalCount = await Order.countDocuments(filter);
    } else if (req.user.role === "seller") {
      const filter = { "orderItems.seller": req.user._id };
      if (status) filter["orderItems.sellerStatus"] = status;

      const allOrders = await Order.find(filter)
        .populate("user", "name email")
        .populate("orderItems.book")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      orders = allOrders.map((order) => ({
        ...order.toObject(),
        orderItems: order.orderItems.filter(
          (i) => i.seller?.toString() === req.user._id.toString()
        ),
      }));

      totalCount = await Order.countDocuments(filter);
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    res.json({
      orders,
      totalOrders: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Order Item Status
const updateOrderStatus = async (req, res) => {
  const { orderId, bookId } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: "Status is required" });

  try {
    const order = await getOrderOrFail(orderId);
    const item = order.orderItems.find((i) => i.book.toString() === bookId);
    if (!item) return res.status(404).json({ message: "Order item not found" });

    if (
      req.user.role === "seller" &&
      item.seller?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (!isAdminOrSeller(req.user)) {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    if (!validateStatusTransition(item.sellerStatus, status)) {
      return res.status(400).json({
        message: `Invalid transition from ${item.sellerStatus} to ${status}`,
      });
    }

    item.sellerStatus = status;
    item.statusUpdatedAt = new Date();

    if (status === "processing") item.processingAt = new Date();
    if (status === "shipped") item.shippedAt = new Date();
    if (status === "delivered") item.deliveredAt = new Date();
    if (status === "canceled") item.canceledAt = new Date();

    const statuses = order.orderItems.map((i) => i.sellerStatus);

    if (statuses.every((s) => s === "delivered")) {
      order.status = "delivered";
      order.deliveredAt = new Date();
    } else if (statuses.every((s) => s === "canceled")) {
      order.status = "canceled";
      order.canceledAt = new Date();
    } else if (statuses.includes("shipped")) {
      order.status = "shipped";
    } else if (statuses.includes("processing")) {
      order.status = "processing";
    } else {
      order.status = "pending";
    }

    const updated = await order.save();

    res.json({ message: "Order item status updated", order: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel Order
const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;

  try {
    const order = await getOrderOrFail(orderId);

    if (order.status === "delivered") {
      return res
        .status(400)
        .json({ message: "Cannot cancel delivered orders" });
    }

    if (!isAdminOrSeller(req.user)) {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (req.user.role === "seller") {
        const sellerItems = order.orderItems.filter(
          (i) => i.seller?.toString() === req.user._id.toString()
        );

        if (!sellerItems.length) {
          return res
            .status(403)
            .json({ message: "No items to cancel for this seller" });
        }

        for (const item of sellerItems) {
          if (item.sellerStatus !== "canceled") {
            item.sellerStatus = "canceled";
            item.canceledAt = new Date();
            await Book.findByIdAndUpdate(
              item.book,
              { $inc: { countInStock: item.quantity } },
              { session }
            );
          }
        }
      } else if (req.user.role === "admin") {
        for (const item of order.orderItems) {
          if (item.sellerStatus !== "canceled") {
            item.sellerStatus = "canceled";
            await Book.findByIdAndUpdate(
              item.book,
              { $inc: { countInStock: item.quantity } },
              { session }
            );
          }
        }
        order.cancellationReason = reason || "Canceled by admin";
      }

      if (order.orderItems.every((i) => i.sellerStatus === "canceled")) {
        order.status = "canceled";
        order.canceledAt = new Date();
      }

      await order.save({ session });
      await session.commitTransaction();

      res.json({ message: "Order canceled", order });
    } catch (err) {
      await session.abortTransaction();
      res.status(500).json({ message: err.message });
    } finally {
      session.endSession();
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Order
const deleteOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await getOrderOrFail(orderId);

    if (order.status !== "canceled") {
      return res
        .status(400)
        .json({ message: "Only canceled orders can be deleted" });
    }

    if (!isAdminOrSeller(req.user)) {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    if (req.user.role === "seller") {
      order.orderItems = order.orderItems.filter(
        (i) => i.seller?.toString() !== req.user._id.toString()
      );

      if (order.orderItems.length === 0) {
        await Order.findByIdAndDelete(orderId);
        return res.json({ message: "Order fully deleted" });
      }

      await order.save();
      return res.json({ message: "Seller's items removed from order", order });
    }

    if (req.user.role === "admin") {
      await Order.findByIdAndDelete(orderId);
      return res.json({ message: "Order deleted by admin" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify Payment
const verifyPayment = async (req, res) => {
  const { sessionId, orderId } = req.body;

  if (!sessionId || !orderId) {
    return res.status(400).json({ message: "Missing session ID or order ID" });
  }

  try {
    const order = await getOrderOrFail(orderId);

    if (order.isPaid) {
      return res.status(400).json({ message: "Order already paid" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      order.isPaid = true;
      order.paidAt = new Date();
      order.status = "processing";
      order.paymentResult = {
        id: session.id,
        status: session.payment_status,
        update_time: new Date().toISOString(),
        email_address: session.customer_details?.email || "",
        payment_intent: session.payment_intent || "",
      };

      await order.save();

      await Transaction.findOneAndUpdate(
        { checkoutSessionId: session.id },
        { status: "completed", orderId: order._id }
      );

      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $set: { items: [] } }
      );

      return res.json({ message: "Payment verified", order });
    }

    res.status(400).json({ message: "Payment not completed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Order Status Summary
const getOrderStatusSummary = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await getOrderOrFail(orderId);

    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const summary = {
      orderId: order._id,
      overallStatus: order.status,
      isPaid: order.isPaid,
      createdAt: order.createdAt,
      orderItems: order.orderItems.map((item) => ({
        bookId: item.book,
        seller: item.seller,
        status: item.sellerStatus,
        updatedAt: item.statusUpdatedAt,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
  verifyPayment,
  getOrderStatusSummary,
};
