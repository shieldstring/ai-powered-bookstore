/**
 * Seed Wisdom Peters courses into MongoDB.
 * Run: node scripts/insertCourses.js
 *
 * Safe to re-run — upserts by unique course ISBN.
 */
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/User");
const Book = require("../models/Book");
const { courses, COURSE_IMAGE } = require("./courseData");

const AUTHOR = "Wisdom Peters";
const PUBLISHER = "Wisdom Peters";

async function resolveSeller() {
  const candidates = [
    "platformseller@example.com",
    "contact@wisdompeters.com",
    "admin@example.com",
  ];

  for (const email of candidates) {
    const user = await User.findOne({ email });
    if (user) return user;
  }

  const seller = await User.findOne({ role: { $in: ["seller", "admin"] } });
  if (seller) return seller;

  throw new Error(
    "No seller or admin user found. Run scripts/createUsers.js first."
  );
}

function buildCourseDocument(course, sellerId) {
  return {
    title: course.title,
    author: AUTHOR,
    seller: sellerId,
    description: course.description,
    price: course.price,
    originalPrice: course.originalPrice,
    isbn: course.isbn,
    language: "English",
    format: "Course",
    publishDate: new Date(),
    publisher: PUBLISHER,
    image: course.image || COURSE_IMAGE,
    category: course.category,
    tag: course.tag,
    inventory: 99999,
    isActive: true,
    sections: course.sections,
    baseCurrency: "GBP",
  };
}

async function insertCourses() {
  try {
    await connectDB(false);
    const seller = await resolveSeller();
    console.log(`Using seller: ${seller.name} (${seller.email})`);

    let created = 0;
    let updated = 0;

    for (const course of courses) {
      const doc = buildCourseDocument(course, seller._id);
      const existing = await Book.findOne({ isbn: course.isbn });

      if (existing) {
        await Book.findByIdAndUpdate(
          existing._id,
          { $set: doc },
          { runValidators: true }
        );
        updated += 1;
        console.log(`Updated: ${course.title}`);
      } else {
        await Book.create(doc);
        created += 1;
        console.log(`Created: ${course.title}`);
      }
    }

    console.log(`\nDone. ${created} created, ${updated} updated (${courses.length} total).`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error inserting courses:", err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

insertCourses();
