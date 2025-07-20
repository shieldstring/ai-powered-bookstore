const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/User");
const Book = require("../models/Book");
const { bookSampleData } = require("./bookSampleData");

async function insertBooks() {
  try {
    await connectDB();

    // Find or create platform seller
    let platformSeller = await User.findOne({ email: "platformseller@example.com" });

    if (!platformSeller) {
      platformSeller = await User.create({
        name: "Platform Seller",
        email: "platformseller@example.com",
        password: "platformpassword123", // Make sure you hash it in real scenarios
        role: "seller",
        profilePicture: "https://example.com/avatars/seller.png",
        bio: "Default platform seller",
        tokens: 0,
        xp: 0,
        level: 1,
        referralCode: "PLATFORM123",
      });

      console.log("Created platform seller account");
    } else {
      console.log("Platform seller already exists");
    }

    // Add seller ID to each book
    const booksWithSeller = bookSampleData.map((book) => ({
      ...book,
      seller: platformSeller._id,
    }));

    // Clear existing books and insert new ones
    await Book.deleteMany({});
    const inserted = await Book.insertMany(booksWithSeller);

    console.log(`Inserted ${inserted.length} books linked to platform seller.`);

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error inserting books:", err);
    process.exit(1);
  }
}

insertBooks();
