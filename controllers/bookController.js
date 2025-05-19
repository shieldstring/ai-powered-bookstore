const Book = require("../models/Book");
const mongoose = require("mongoose");

// Configuration for recommendation service
const RECOMMENDATION_SERVICE_URL = process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:5000';
const DEFAULT_RECOMMENDATION_COUNT = 6;

// Helper function for pagination
const getPaginationOptions = (query) => ({
  page: parseInt(query.page) || 1,
  limit: parseInt(query.limit) || 10,
  sort: query.sort || '-createdAt'
});

// Get all books with filtering, sorting, and pagination
const getBooks = async (req, res) => {
  try {
    const { page, limit, sort } = getPaginationOptions(req.query);
    const skip = (page - 1) * limit;

    // Build the query filters
    const filters = {
      isActive: true,
      ...(req.query.keyword && { 
        $text: { $search: req.query.keyword } 
      }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.author && { author: req.query.author }),
      ...(req.query.minPrice && { price: { $gte: parseFloat(req.query.minPrice) } }),
      ...(req.query.maxPrice && { price: { ...(req.query.minPrice ? filters.price : {}), $lte: parseFloat(req.query.maxPrice) } }),
      ...(req.query.format && { format: req.query.format }),
      ...(req.query.language && { language: req.query.language }),
      ...(req.query.tag && { tags: req.query.tag })
    };

    // Determine sort option
    let sortOption = {};
    switch (sort) {
      case 'price-asc': sortOption = { price: 1 }; break;
      case 'price-desc': sortOption = { price: -1 }; break;
      case 'newest': sortOption = { createdAt: -1 }; break;
      case 'oldest': sortOption = { createdAt: 1 }; break;
      case 'rating': sortOption = { averageRating: -1 }; break;
      case 'bestseller': sortOption = { purchaseCount: -1 }; break;
      case 'title-asc': sortOption = { title: 1 }; break;
      case 'title-desc': sortOption = { title: -1 }; break;
      default: sortOption = { createdAt: -1 };
    }

    // Get total count and books
    const [total, books] = await Promise.all([
      Book.countDocuments(filters),
      Book.find(filters)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .select('-reviews -salesHistory -__v')
        .lean()
    ]);

    res.json({
      success: true,
      count: books.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: books
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching books",
      error: error.message 
    });
  }
};

// Get a single book by ID with full details
const getBookById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid book ID format" 
      });
    }

    const book = await Book.findById(req.params.id)
      .populate('reviews.user', 'name avatar')
      .populate('salesHistory.orderId', 'status totalPrice');

    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: "Book not found" 
      });
    }

    // Increment view count
    await book.incrementViews();

    res.json({ 
      success: true,
      data: book 
    });
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching book",
      error: error.message 
    });
  }
};

// Add a new book
const addBook = async (req, res) => {
  try {
    const bookData = {
      ...req.body,
      // Ensure required fields
      title: req.body.title.trim(),
      author: req.body.author.trim(),
      price: parseFloat(req.body.price),
      inventory: parseInt(req.body.inventory) || 0,
      isActive: req.body.inventory > 0
    };

    const book = await Book.create(bookData);
    
    res.status(201).json({ 
      success: true,
      data: book 
    });
  } catch (error) {
    console.error("Error adding book:", error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        success: false,
        message: "Validation error",
        errors: messages 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Server error while adding book",
      error: error.message 
    });
  }
};

// Update a book
/**
 * @desc    Update a book (handles both PUT and PATCH)
 * @route   PUT /api/books/:id (full update)
 * @route   PATCH /api/books/:id (partial update)
 * @access  Private/Admin
 */
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate book ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID format"
      });
    }

    // Find existing book
    const existingBook = await Book.findById(id);
    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    // Prepare update data
    const updateData = {
      ...(req.method === 'PUT' ? { 
        // For PUT (full update), include all required fields with defaults
        title: req.body.title || existingBook.title,
        author: req.body.author || existingBook.author,
        price: req.body.price !== undefined ? parseFloat(req.body.price) : existingBook.price,
        // ... other required fields
      } : { 
        // For PATCH (partial update), only include provided fields
        ...req.body 
      }),
      
      // Common processing for both methods
      ...(req.body.price !== undefined && { price: parseFloat(req.body.price) }),
      ...(req.body.inventory !== undefined && { 
        inventory: parseInt(req.body.inventory),
        isActive: parseInt(req.body.inventory) > 0
      })
    };

    // Validate price relationship
    if (updateData.price && updateData.originalPrice) {
      if (updateData.originalPrice < updateData.price) {
        return res.status(400).json({
          success: false,
          message: "Original price must be greater than current price"
        });
      }
    }

    // Execute update
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: true,
        context: 'query',
        overwrite: req.method === 'PUT' // Only for full updates
      }
    ).populate('reviews.user', 'name avatar');

    // Handle inventory changes
    if (req.body.inventory !== undefined && 
        req.body.inventory !== existingBook.inventory) {
      const adjustment = parseInt(req.body.inventory) - existingBook.inventory;
      
      await Book.findByIdAndUpdate(id, {
        $push: {
          inventoryHistory: {
            date: new Date(),
            adjustment,
            newValue: parseInt(req.body.inventory),
            reason: req.method === 'PUT' ? 'Full update' : 'Partial update',
            admin: req.user._id
          }
        }
      });
    }

    res.json({
      success: true,
      message: `Book ${req.method === 'PUT' ? 'replaced' : 'updated'} successfully`,
      data: updatedBook
    });

  } catch (error) {
    console.error(`Error ${req.method === 'PUT' ? 'replacing' : 'updating'} book:`, error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages
      });
    }
    
    if (error.code === 11000 && error.keyPattern?.isbn) {
      return res.status(400).json({
        success: false,
        message: "ISBN already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: `Server error while ${req.method === 'PUT' ? 'replacing' : 'updating'} book`
    });
  }
};

// Delete a book (soft delete)
const deleteBook = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid book ID format" 
      });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: "Book not found" 
      });
    }

    res.json({ 
      success: true,
      message: "Book deactivated successfully",
      data: book 
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while deleting book",
      error: error.message 
    });
  }
};

// Add a review to a book
const addReview = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid book ID format" 
      });
    }

    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false,
        message: "Rating must be between 1 and 5" 
      });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: "Book not found" 
      });
    }

    // Check if user already reviewed this book
    const existingReviewIndex = book.reviews.findIndex(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReviewIndex >= 0) {
      // Update existing review
      book.reviews[existingReviewIndex].rating = rating;
      book.reviews[existingReviewIndex].comment = comment || '';
    } else {
      // Add new review
      book.reviews.push({
        user: req.user._id,
        rating,
        comment: comment || ''
      });
    }

    await book.save();

    res.status(201).json({ 
      success: true,
      message: "Review submitted successfully",
      data: book 
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while adding review",
      error: error.message 
    });
  }
};

// Update inventory for multiple books (bulk operation)
const bulkUpdateInventory = async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid updates array" 
      });
    }

    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: update.bookId },
        update: { 
          $set: { 
            inventory: update.quantity,
            isActive: update.quantity > 0
          } 
        }
      }
    }));

    const result = await Book.bulkWrite(bulkOps);

    res.json({ 
      success: true,
      message: "Inventory updated successfully",
      data: result 
    });
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while updating inventory",
      error: error.message 
    });
  }
};


const getRecommendations = async (req, res) => {
  try {
    // Extract query parameters
    const userId = req.query.userId || req.user?._id; // Get user ID from query or authenticated user
    const topN = parseInt(req.query.limit || DEFAULT_RECOMMENDATION_COUNT);
    
    // Validate user ID if provided
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }
    
    // Validate book ID if provided for similar books recommendations
    if (req.query.bookId && !mongoose.Types.ObjectId.isValid(req.query.bookId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID format"
      });
    }
    
    // Option 1: Get personalized recommendations if user ID is available
    if (userId) {
      try {
        console.log(`Getting personalized recommendations for user ${userId}`);
        
        // Call Python recommendation service
        const response = await axios.get(`${RECOMMENDATION_SERVICE_URL}/recommend`, {
          params: {
            user_id: userId.toString(),
            top_n: topN
          },
          timeout: 5000 // 5 second timeout to prevent long waits
        });
        
        // Check if recommendations were successfully returned
        if (response.data.success && response.data.recommendations.length > 0) {
          // Convert string IDs to ObjectIds for MongoDB
          const objectIds = response.data.recommendations.map(id => 
            mongoose.Types.ObjectId(id.toString()));
          
          // Fetch full book details from MongoDB
          const recommendations = await Book.find({
            _id: { $in: objectIds },
            isActive: true
          }).select('title author price originalPrice image averageRating reviewCount discountPercentage');
          
          // Return recommendations if found
          if (recommendations.length > 0) {
            return res.json({
              success: true,
              source: "personalized",
              count: recommendations.length,
              data: recommendations
            });
          }
        }
      } catch (error) {
        console.error("Error calling recommendation service:", error.message);
        // Don't return an error, fall back to default recommendations
      }
    }
    
    // Option 2: Get similar book recommendations if bookId is provided
    if (req.query.bookId && mongoose.Types.ObjectId.isValid(req.query.bookId)) {
      try {
        const bookId = mongoose.Types.ObjectId(req.query.bookId);
        const book = await Book.findById(bookId);
        
        if (book) {
          // Get books in the same category with similar attributes
          const similarBooks = await Book.find({
            _id: { $ne: bookId }, // Exclude current book
            isActive: true,
            category: book.category, // Same category
          })
          .sort({ averageRating: -1, purchaseCount: -1 })
          .limit(topN)
          .select('title author price originalPrice image averageRating reviewCount discountPercentage');
          
          if (similarBooks.length > 0) {
            return res.json({
              success: true,
              source: "similar",
              count: similarBooks.length,
              data: similarBooks
            });
          }
        }
      } catch (error) {
        console.error("Error getting similar books:", error.message);
        // Fall back to default recommendations
      }
    }
    
    // Option 3: Default recommendations as fallback
    console.log("Using default recommendations as fallback");
    
    // Build the match conditions for default recommendations
    const matchCondition = { isActive: true };
    
    // Add category filter if provided
    if (req.query.category) {
      matchCondition.category = req.query.category;
    }
    
    // Exclude current book if bookId is provided
    if (req.query.bookId && mongoose.Types.ObjectId.isValid(req.query.bookId)) {
      matchCondition._id = { $ne: mongoose.Types.ObjectId(req.query.bookId) };
    }
    
    // Get default recommendations using MongoDB aggregation
    const defaultRecommendations = await Book.aggregate([
      { $match: matchCondition },
      { $sample: { size: Math.min(topN * 2, 20) } }, // Get more samples for better sorting
      { $sort: { averageRating: -1, purchaseCount: -1 } },
      { $limit: topN },
      { $project: {
        title: 1,
        author: 1,
        price: 1,
        originalPrice: 1,
        image: 1,
        averageRating: 1,
        reviewCount: 1,
        discountPercentage: 1
      }}
    ]);
    
    // Return default recommendations
    return res.json({
      success: true,
      source: "default",
      count: defaultRecommendations.length,
      data: defaultRecommendations
    });
    
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while getting recommendations",
      error: error.message
    });
  }
};

// Track a book purchase (used by order system)
const trackPurchase = async (req, res) => {
  try {
    const { bookId, quantity, orderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid book ID format" 
      });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: "Book not found" 
      });
    }

    await book.updateInventory(-quantity, orderId);

    res.json({ 
      success: true,
      message: "Purchase tracked successfully",
      data: book 
    });
  } catch (error) {
    console.error("Error tracking purchase:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Server error while tracking purchase",
      error: error.message 
    });
  }
};

module.exports = {
  getBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  addReview,
  bulkUpdateInventory,
  getRecommendations,
  trackPurchase
};