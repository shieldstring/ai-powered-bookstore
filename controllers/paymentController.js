const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Transaction = require("../models/Transaction");
const { v4: uuidv4 } = require('uuid'); // Make sure to have this for idempotency

// Create a checkout session
const createCheckoutSession = async (req, res) => {
  const { amount, currency = 'usd', items, cartId, successUrl, cancelUrl } = req.body;
  
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

    // Add idempotency key to prevent duplicate sessions
    const idempotencyKey = req.headers['idempotency-key'] || uuidv4();

    // Format line items for Checkout
    const lineItems = items ? items : [
      {
        price_data: {
          currency,
          product_data: {
            name: "Your purchase",
          },
          unit_amount: amount,
        },
        quantity: 1,
      }
    ];

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: { 
        userId: req.user._id.toString(),
        cartId: cartId || null
      },
    }, {
      idempotencyKey
    });

    // Log transaction
    await Transaction.create({
      user: req.user._id,
      amount: amount / 100,
      currency,
      type: "purchase",
      status: "pending",
      checkoutSessionId: session.id
    });

    // Return the session URL - client will redirect to this URL
    res.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error("Checkout session error:", error);
    res.status(500).json({
      message: error.message || "Payment processing error"
    });
  }
};

// Get checkout session status
const getCheckoutStatus = async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Find if this session is associated with an order
    const transaction = await Transaction.findOne({
      checkoutSessionId: sessionId,
    });
    let orderId = null;

    if (transaction && transaction.orderId) {
      orderId = transaction.orderId;
    }

    res.json({
      status: session.payment_status,
      orderId,
    });
  } catch (error) {
    console.error("Error retrieving checkout status:", error);
    res.status(500).json({ message: "Error retrieving checkout status" });
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
    case "checkout.session.completed":
      const session = event.data.object;
      console.log("Checkout session completed:", session.id);

      // Update transaction status
      const transaction = await Transaction.findOne({
        checkoutSessionId: session.id,
      });
      
      if (transaction) {
        transaction.status = "completed";
        await transaction.save();
        
        // If transaction is linked to an order, update it
        if (transaction.orderId) {
          const Order = require("../models/Order");
          const order = await Order.findById(transaction.orderId);
          if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
              id: session.id,
              status: "completed",
              update_time: new Date().toISOString(),
              email_address: session.customer_details?.email || "",
            };
            await order.save();
          }
        }
      }
      break;

    case "checkout.session.expired":
      const expiredSession = event.data.object;
      console.log("Checkout session expired:", expiredSession.id);
      
      // Update transaction status
      const expiredTransaction = await Transaction.findOne({
        checkoutSessionId: expiredSession.id,
      });
      
      if (expiredTransaction) {
        expiredTransaction.status = "expired";
        await expiredTransaction.save();
      }
      break;
      


    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
};

module.exports = {
  createCheckoutSession,
  getCheckoutStatus,
  handleWebhook,
};