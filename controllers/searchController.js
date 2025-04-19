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

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    });

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