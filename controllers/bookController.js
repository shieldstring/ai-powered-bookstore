const Book = require("../models/Book");

// Get all books with limited details (including rating and reviewCount)
const getBooks = async (req, res) => {
  try {
    // Extract query parameters
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const keyword = req.query.keyword
      ? {
          title: {
            $regex: req.query.keyword,
            $options: "i",
          },
        }
      : {};

    // Category filter
    const category = req.query.category ? { category: req.query.category } : {};

    // Author filter
    const author = req.query.author ? { author: req.query.author } : {};

    // Price range filter
    const priceFilter = {};
    if (req.query.minPrice) {
      priceFilter.price = {
        ...priceFilter.price,
        $gte: Number(req.query.minPrice),
      };
    }
    if (req.query.maxPrice) {
      priceFilter.price = {
        ...priceFilter.price,
        $lte: Number(req.query.maxPrice),
      };
    }

    // Sort options
    let sortOption = {};
    if (req.query.sort) {
      switch (req.query.sort) {
        case "price-asc":
          sortOption = { price: 1 };
          break;
        case "price-desc":
          sortOption = { price: -1 };
          break;
        case "newest":
          sortOption = { createdAt: -1 };
          break;
        case "rating":
          // For rating sort, we'll handle it after fetching the books
          sortOption = { createdAt: -1 };
          break;
        case "bestseller":
          sortOption = { purchaseCount: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    } else {
      sortOption = { createdAt: -1 }; // Default sorting
    }

    // Count total books that match the query
    const count = await Book.countDocuments({
      ...keyword,
      ...category,
      ...author,
      ...priceFilter,
    });

    // Get books with pagination
    let books = await Book.find({
      ...keyword,
      ...category,
      ...author,
      ...priceFilter,
    })
      .sort(sortOption)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    // Map books to include only the fields we want
    const formattedBooks = books.map((book) => {
      // Calculate rating manually from reviews
      let rating = 0;
      if (book.reviews && book.reviews.length > 0) {
        const totalRating = book.reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        rating = parseFloat((totalRating / book.reviews.length).toFixed(1));
      }

      // Get review count
      const reviewCount = book.reviews ? book.reviews.length : 0;

      // Return simplified book object
      return {
        _id: book._id,
        title: book.title,
        author: book.author,
        price: book.price,
        originalPrice: book.originalPrice,
        image: book.image,
        tag: book.tag,
        category: book.category,
        description: book.description,
        rating,
        reviewCount,
      };
    });

    // Handle special case for rating sort
    if (req.query.sort === "rating") {
      formattedBooks.sort((a, b) => b.rating - a.rating);
    }

    // Return response with pagination info
    res.json({
      books: formattedBooks,
      page,
      pages: Math.ceil(count / pageSize),
      totalBooks: count,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add a new book
const addBook = async (req, res) => {
  const { title, author, description, price, image, category } = req.body;

  try {
    const book = await Book.create({
      title,
      author,
      description,
      price,
      image,
      category,
    });
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

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
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a book
const deleteBook = async (req, res) => {
  const { id } = req.params;

  try {
    const book = await Book.findByIdAndDelete(id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Track a book purchase
const trackPurchase = async (req, res) => {
  const { id } = req.params;

  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Increment purchase count
    book.purchaseCount += 1;
    await book.save();

    res.json({
      message: "Purchase tracked",
      purchaseCount: book.purchaseCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Add a review to a book
const addReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
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
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single book by ID
const getBookById = async (req, res) => {
  const { id } = req.params;

  try {
    const book = await Book.findById(id).populate("reviews.user", "name");
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get AI-curated book recommendations
const getRecommendations = async (req, res) => {
  try {
    // Example: Recommend books based on user's reading history (to be replaced with AI logic)
    const recommendedBooks = await Book.find().limit(10); // Replace with AI logic
    res.json(recommendedBooks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Search books manually
const searchBooks = async (req, res) => {
  const { query } = req.query;

  try {
    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { author: { $regex: query, $options: "i" } },
        { genre: { $regex: query, $options: "i" } },
      ],
    });

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update book inventory
const updateInventory = async (req, res) => {
  const { id } = req.params;
  const { inventory } = req.body;

  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    book.inventory = inventory;
    await book.save();

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Bulk delete books
const bulkDeleteBooks = async (req, res) => {
  const { bookIds } = req.body;

  try {
    await Book.deleteMany({ _id: { $in: bookIds } });
    res.json({ message: "Books deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Bulk update inventory
const bulkUpdateInventory = async (req, res) => {
  const { bookIds, inventory } = req.body;

  try {
    await Book.updateMany({ _id: { $in: bookIds } }, { $set: { inventory } });
    res.json({ message: "Inventory updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  getBooks,
  addBook,
  editBook,
  deleteBook,
  trackPurchase,
  addReview,
  getBookById,
  getRecommendations,
  searchBooks,
  updateInventory,
  bulkDeleteBooks,
  bulkUpdateInventory,
};
