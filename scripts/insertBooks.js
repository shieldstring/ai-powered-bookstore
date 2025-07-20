const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("../config/db");
const Book = require("../models/Book");
const User = require("../models/User");

const bookSampleData = require("./bookSampleData").bookSampleData; // Import your data array

async function insertSampleBooksWithSeller() {
  try {
    await connectDB();

    const sellerEmail = "platformseller@example.com";
    const sellerUser = await User.findOne({ email: sellerEmail });

    if (!sellerUser) {
      throw new Error(
        `Platform seller with email ${sellerEmail} not found. Please run the seller setup script first.`
      );
    }

    // Attach seller to each book
    const booksWithSeller = bookSampleData.map((book) => ({
      ...book,
      seller: sellerUser._id,
    }));

    // Clean and insert
    await Book.deleteMany({});
    const result = await Book.insertMany(booksWithSeller);

    console.log(`Inserted ${result.length} books linked to platform seller: ${sellerEmail}`);

    await mongoose.disconnect();
    console.log("Disconnected from database");
  } catch (err) {
    console.error("Error inserting books:", err.message);
    process.exit(1);
  }
}

// Run
insertSampleBooksWithSeller();
