const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Transaction = require("../models/Transaction");

// Create a payment intent
const createPaymentIntent = async (req, res) => {
  const { amount } = req.body;
  try {
    // Default to USD if currency isn't provided
    const currency = req.body.currency || "usd";

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: { userId: req.user._id.toString() },
    });

    // Log the transaction
    await Transaction.create({
      user: req.user._id,
      amount: amount / 100,
      type: "purchase",
      description: "Book purchase",
      paymentIntentId: paymentIntent.id,
    });

    // Return both client secret and payment intent ID
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);
    res.status(500).json({
      message: error.message || "Server error creating payment intent",
    });
  }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
  const { paymentId } = req.params;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

    // Find if this payment is associated with an order
    const transaction = await Transaction.findOne({
      paymentIntentId: paymentId,
    });
    let orderId = null;

    if (transaction && transaction.orderId) {
      orderId = transaction.orderId;
    }

    res.json({
      status: paymentIntent.status,
      orderId,
    });
  } catch (error) {
    console.error("Error retrieving payment status:", error);
    res.status(500).json({ message: "Error retrieving payment status" });
  }
};

// Handle webhook events from Stripe
const handleWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle specific events
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("PaymentIntent succeeded:", paymentIntent.id);

      // Update transaction and order status
      const transaction = await Transaction.findOne({
        paymentIntentId: paymentIntent.id,
      });
      if (transaction && transaction.orderId) {
        const Order = require("../models/Order");
        const order = await Order.findById(transaction.orderId);
        if (order) {
          order.isPaid = true;
          order.paidAt = Date.now();
          order.paymentResult = {
            id: paymentIntent.id,
            status: "succeeded",
            update_time: new Date().toISOString(),
            email_address: paymentIntent.receipt_email || "",
          };
          await order.save();
        }
      }
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      console.log("Payment failed:", failedPayment.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
};

module.exports = {
  createPaymentIntent,
  getPaymentStatus,
  handleWebhook,
};
