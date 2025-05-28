const Book = require('../models/Book');
const User = require('../models/User');
const Group = require('../models/Group');

// Global search
const search = async (req, res) => {
  const { query } = req.query;

  try {
    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { genre: { $regex: query, $options: 'i' } },
      ],
    });

    // Build the query for users, considering privacy settings
    const userQuery = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
      // Add privacy filter: public OR (private AND is a follower)
      $or: [
        { isPublic: true },
        { followers: req.user._id } // Assuming req.user._id is available from authentication middleware
      ]
    };
    const users = await User.find(userQuery);

    const groups = await Group.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    });

    res.json({ books, users, groups });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { search };