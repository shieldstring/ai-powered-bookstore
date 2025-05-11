// Sample data for MongoDB Book collection with embedded reviews
// Note: MongoDB will automatically generate _id fields for the main documents and subdocuments
const mongoose = require("mongoose");

const bookSampleData = [
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
    price: 24.99,
    originalPrice: 29.99,
    isbn: "9780525559474",
    language: "English",
    format: "Hardcover",
    publishDate: new Date("2020-09-29"),
    publisher: "Viking",
    image: "https://images.example.com/midnight-library.jpg",
    category: "Fiction",
    tags: ["bestseller", "contemporary"],
    affiliateLink: "https://bookstore.com/midnight-library",
    inventory: 45,
    purchaseCount: 1289,
    isActive: true,
    viewCount: 3421,
    wishlistCount: 876,
    edition: "First Edition",
    pageCount: 304,
    dimensions: {
      height: 9.25,
      width: 6.25,
      thickness: 1.1
    },
    weight: 1.2,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c85"),
        rating: 5,
        comment: "Absolutely life-changing book. The concept really made me think about my choices.",
        helpfulVotes: 42,
        createdAt: new Date("2023-09-15"),
        updatedAt: new Date("2023-09-15")
      }
    ],
    salesHistory: [
      {
        date: new Date("2023-09-20"),
        quantity: 5,
        revenue: 124.95,
        orderId: new mongoose.Types.ObjectId("60d21b4667d0d8992e611a01")
      }
    ],
    createdAt: new Date("2023-08-01"),
    updatedAt: new Date("2024-01-15")
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world.",
    price: 17.99,
    originalPrice: 21.99,
    isbn: "9780441172719",
    language: "English",
    format: "Paperback",
    publishDate: new Date("1990-09-01"),
    publisher: "Ace Books",
    image: "https://images.example.com/dune.jpg",
    category: "Science Fiction",
    tags: ["classic", "sci-fi"],
    affiliateLink: "https://bookstore.com/dune",
    inventory: 78,
    purchaseCount: 3421,
    isActive: true,
    viewCount: 8923,
    wishlistCount: 1567,
    edition: "Special Edition",
    pageCount: 896,
    dimensions: {
      height: 8.0,
      width: 5.25,
      thickness: 1.5
    },
    weight: 1.1,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c88"),
        rating: 5,
        comment: "A masterpiece of science fiction. The worldbuilding is unparalleled.",
        helpfulVotes: 87,
        createdAt: new Date("2023-08-29"),
        updatedAt: new Date("2023-08-29")
      }
    ],
    salesHistory: [
      {
        date: new Date("2023-09-01"),
        quantity: 10,
        revenue: 179.90,
        orderId: new mongoose.Types.ObjectId("60d21b4667d0d8992e611a04")
      }
    ],
    createdAt: new Date("2023-06-15"),
    updatedAt: new Date("2024-03-10")
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    description: "An easy and proven way to build good habits and break bad ones.",
    price: 15.99,
    originalPrice: 19.99,
    isbn: "9780735211292",
    language: "English",
    format: "Hardcover",
    publishDate: new Date("2018-10-16"),
    publisher: "Avery",
    image: "https://images.example.com/atomic-habits.jpg",
    category: "Self-help",
    tags: ["productivity", "psychology"],
    affiliateLink: "https://bookstore.com/atomic-habits",
    inventory: 120,
    purchaseCount: 5231,
    isActive: true,
    viewCount: 6543,
    wishlistCount: 2345,
    edition: "First Edition",
    pageCount: 320,
    dimensions: {
      height: 9.0,
      width: 6.0,
      thickness: 1.0
    },
    weight: 1.0,
    reviews: [
      {
        user: new mongoose.Types.ObjectId("60d21b4667d0d8992e610c8b"),
        rating: 5,
        comment: "Changed how I approach behavior change. The 1% better concept is revolutionary.",
        helpfulVotes: 156,
        createdAt: new Date("2023-10-22"),
        updatedAt: new Date("2023-10-22")
      }
    ],
    salesHistory: [
      {
        date: new Date("2023-11-15"),
        quantity: 8,
        revenue: 127.92,
        orderId: new mongoose.Types.ObjectId("60d21b4667d0d8992e611a06")
      }
    ],
    createdAt: new Date("2023-05-20"),
    updatedAt: new Date("2024-02-28")
  }
];

// Insert function remains the same
async function insertSampleData() {
  try {
    const Book = require("./models/Book");
    await Book.deleteMany({});
    const result = await Book.insertMany(bookSampleData);
    console.log(`Inserted ${result.length} books`);
    return result;
  } catch (error) {
    console.error("Error inserting sample data:", error);
    throw error;
  }
}

module.exports = { bookSampleData, insertSampleData };