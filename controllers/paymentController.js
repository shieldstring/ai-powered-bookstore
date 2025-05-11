const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Transaction = require("../models/Transaction");

// Create a payment intent
const createPaymentIntent = async (req, res) => {
  const { amount, currency = 'usd' } = req.body;
  
  try {
    // Validate amount based on currency
    const minimumAmounts = {
      usd: 50,    // $0.50
      eur: 50,    // €0.50
      gbp: 30,    // £0.30
      // Add other supported currencies
    };

    const minimumAmount = minimumAmounts[currency.toLowerCase()] || 50;
    
    if (amount < minimumAmount) {
      return res.status(400).json({
        message: `Minimum payment amount is ${minimumAmount/100} ${currency.toUpperCase()}`
      });
    }

    // Add idempotency key to prevent duplicate payments
    const idempotencyKey = req.headers['idempotency-key'] || uuidv4();

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: { 
        userId: req.user._id.toString(),
        cartId: req.body.cartId // Optional: track which cart this is for
      },
      automatic_payment_methods: { enabled: true }
    }, {
      idempotencyKey
    });

    // Log transaction
    await Transaction.create({
      user: req.user._id,
      amount: amount / 100,
      currency,
      type: "purchase",
      status: "requires_payment_method",
      paymentIntentId: paymentIntent.id
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    res.status(500).json({
      message: error.message || "Payment processing error"
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
