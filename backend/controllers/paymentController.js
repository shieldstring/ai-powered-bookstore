const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Transaction = require('../models/Transaction');

// Create a payment intent
const createPaymentIntent = async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    // Log the transaction
    await Transaction.create({ user: req.user._id, amount: amount / 100, type: 'purchase', description: 'Book purchase' });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createPaymentIntent };