const Cart = require('../models/Cart');
const Book = require('../models/Book');
const Order = require('../models/Order');

// Add a book to the cart
const addToCart = async (req, res) => {
  const { bookId, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const itemIndex = cart.items.findIndex((item) => item.book.toString() === bookId);

    if (itemIndex >= 0) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ book: bookId, quantity });
    }

    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Process an order
const processOrder = async (req, res) => {
  const { cartId } = req.body;

  try {
    const cart = await Cart.findById(cartId).populate('items.book');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Calculate total price
    const totalPrice = cart.items.reduce((total, item) => total + item.book.price * item.quantity, 0);

    // Create an order
    const order = await Order.create({ user: req.user._id, items: cart.items, totalPrice });

    // Clear the cart
    await Cart.findByIdAndDelete(cartId);

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addToCart, processOrder };