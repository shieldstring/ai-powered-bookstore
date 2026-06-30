const Transaction = require("../models/Transaction");
const Order = require("../models/Order");
const {
  normalizeCurrency,
  formatPayPalAmount,
  BASE_CURRENCY,
} = require("../utils/currency");
const {
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalOrder,
} = require("../utils/paypal");

const createPayPalCheckout = async (req, res) => {
  const { orderId, currency = BASE_CURRENCY, successUrl, cancelUrl } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: "Order is already paid" });
    }

    const checkoutCurrency = normalizeCurrency(currency || order.currency);
    const amount = formatPayPalAmount(order.totalPrice);

    const items = order.orderItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitAmount: formatPayPalAmount(item.price),
    }));

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const paypalOrder = await createPayPalOrder({
      orderId: order._id.toString(),
      amount,
      currency: checkoutCurrency,
      items,
      returnUrl:
        successUrl ||
        `${frontendUrl}/checkout/success?order_id=${order._id}`,
      cancelUrl: cancelUrl || `${frontendUrl}/cart`,
    });

    await Transaction.create({
      user: req.user._id,
      amount: order.totalPrice,
      currency: checkoutCurrency,
      type: "purchase",
      status: "pending",
      paypalOrderId: paypalOrder.id,
      orderId: order._id,
    });

    order.paymentResult = {
      id: paypalOrder.id,
      status: "pending",
      update_time: new Date().toISOString(),
      email_address: req.user.email || "",
    };
    await order.save();

    res.json({
      paypalOrderId: paypalOrder.id,
      approvalUrl: paypalOrder.approvalUrl,
    });
  } catch (error) {
    console.error("PayPal checkout error:", error.response?.data || error.message);
    res.status(500).json({
      message: error.response?.data?.message || error.message || "PayPal checkout failed",
    });
  }
};

const capturePayPalPayment = async (req, res) => {
  const { paypalOrderId, orderId } = req.body;

  if (!paypalOrderId || !orderId) {
    return res.status(400).json({ message: "PayPal order ID and order ID are required" });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.isPaid) {
      return res.json({ message: "Order already paid", order });
    }

    const captureResult = await capturePayPalOrder(paypalOrderId);
    const capture = captureResult.purchase_units?.[0]?.payments?.captures?.[0];

    if (captureResult.status !== "COMPLETED" || !capture) {
      return res.status(400).json({ message: "Payment was not completed" });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.status = "processing";
    order.paymentResult = {
      id: capture.id,
      status: capture.status,
      update_time: new Date().toISOString(),
      email_address: captureResult.payer?.email_address || "",
      paypal_order_id: paypalOrderId,
    };
    await order.save();

    const { enrollUserInPurchasedCourses } = require("./orderController");
    await enrollUserInPurchasedCourses(order._id, order.user);

    await Transaction.findOneAndUpdate(
      { paypalOrderId },
      { status: "completed", orderId: order._id }
    );

    const Cart = require("../models/Cart");
    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });

    res.json({ message: "Payment captured", order });
  } catch (error) {
    console.error("PayPal capture error:", error.response?.data || error.message);
    res.status(500).json({
      message: error.response?.data?.message || error.message || "Failed to capture payment",
    });
  }
};

const getPayPalCheckoutStatus = async (req, res) => {
  const { paypalOrderId } = req.params;

  try {
    const paypalOrder = await getPayPalOrder(paypalOrderId);
    const transaction = await Transaction.findOne({ paypalOrderId });

    res.json({
      status: paypalOrder.status,
      orderId: transaction?.orderId || null,
    });
  } catch (error) {
    console.error("PayPal status error:", error.response?.data || error.message);
    res.status(500).json({ message: "Error retrieving PayPal checkout status" });
  }
};

const handlePayPalWebhook = async (req, res) => {
  const event = req.body;
  console.log("PayPal webhook received:", event?.event_type);

  if (event?.event_type === "CHECKOUT.ORDER.APPROVED") {
    const paypalOrderId = event.resource?.id;
    if (paypalOrderId) {
      const transaction = await Transaction.findOne({ paypalOrderId });
      if (transaction && transaction.status === "pending") {
        try {
          await capturePayPalOrder(paypalOrderId);
          transaction.status = "completed";
          await transaction.save();

          if (transaction.orderId) {
            const order = await Order.findById(transaction.orderId);
            if (order && !order.isPaid) {
              order.isPaid = true;
              order.paidAt = new Date();
              order.status = "processing";
              await order.save();

              const { enrollUserInPurchasedCourses } = require("./orderController");
              await enrollUserInPurchasedCourses(order._id, order.user);
            }
          }
        } catch (err) {
          console.error("Webhook capture error:", err.message);
        }
      }
    }
  }

  res.status(200).json({ received: true });
};

module.exports = {
  createPayPalCheckout,
  capturePayPalPayment,
  getPayPalCheckoutStatus,
  handlePayPalWebhook,
};
