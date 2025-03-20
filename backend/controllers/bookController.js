const Book = require('../models/Book');

// Get all books
const getBooks = async (req, res) => {
  try {
    const books = await Book.find({});
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a new book
const addBook = async (req, res) => {
  const { title, author, description, price, image, genre } = req.body;

  try {
    const book = await Book.create({ title, author, description, price, image, genre });
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

e('../models/Book');

// Edit a book
const editBook = async (req, res) => {
  const { id } = req.params;
  const { title, author, description, price, image, genre } = req.body;

  try {
    const book = await Book.findByIdAndUpdate(
      id,
      { title, author, description, price, image, genre },
      { new: true } // Return the updated book
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a book
const deleteBook = async (req, res) => {
  const { id } = req.params;

  try {
    const book = await Book.findByIdAndDelete(id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Track a book purchase
const trackPurchase = async (req, res) => {
    const { id } = req.params;
  
    try {
      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
  
      // Increment purchase count
      book.purchaseCount += 1;
      await book.save();
  
      res.json({ message: 'Purchase tracked', purchaseCount: book.purchaseCount });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
  
 // Add a review to a book
const addReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const review = {
      user: req.user._id,
      rating,
      comment,
    };

    book.reviews.push(review);
    await book.save();

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single book by ID
const getBookById = async (req, res) => {
  const { id } = req.params;

  try {
    const book = await Book.findById(id).populate('reviews.user', 'name');
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get AI-curated book recommendations
const getRecommendations = async (req, res) => {
  try {
    // Example: Recommend books based on user's reading history (to be replaced with AI logic)
    const recommendedBooks = await Book.find().limit(10); // Replace with AI logic
    res.json(recommendedBooks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Search books manually
const searchBooks = async (req, res) => {
  const { query } = req.query;

  try {
    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { genre: { $regex: query, $options: 'i' } },
      ],
    });

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getBooks, addBook, editBook, deleteBook, trackPurchase, addReview, getBookById, getRecommendations, searchBooks };