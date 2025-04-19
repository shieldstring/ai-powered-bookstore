const ReadingList = require('../models/ReadingList');

// Create a reading list
const createReadingList = async (req, res) => {
  const { name, books } = req.body;

  try {
    const readingList = await ReadingList.create({ user: req.user._id, name, books });
    res.status(201).json(readingList);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createReadingList };