const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const Seller = require("../models/Seller");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Function to generate referral code
function generateReferralCode() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

async function createAdminAndPlatformSeller() {
  try {
    await connectDB();

    const adminPassword = "securepassword123";
    const sellerPassword = "platformseller123";

    // -------- Admin User --------
    const adminEmail = "admin@example.com";

    const adminData = {
      name: "Admin User",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      profilePicture: "https://example.com/avatars/admin.jpg",
      bio: "Super administrator for the bookstore platform",
      level: 10,
      xp: 5000,
      tokens: 1000,
      referralCode: generateReferralCode(),
      earnings: 0,
      lastLogin: new Date(),
      loginHistory: [new Date()],
    };

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create(adminData);
      console.log(`Admin user created: ${adminEmail}`);
    } else {
      console.log(`Admin user already exists: ${adminEmail}`);
    }

    // -------- Platform Seller User --------
    const sellerEmail = "platformseller@example.com";

    const sellerUserData = {
      name: "Platform Seller",
      email: sellerEmail,
      password: sellerPassword,
      role: "seller",
      profilePicture: "https://example.com/avatars/platformseller.jpg",
      bio: "Official platform seller account for managing bookstore inventory.",
      level: 5,
      xp: 1000,
      tokens: 500,
      referralCode: generateReferralCode(),
      earnings: 0,
      lastLogin: new Date(),
      loginHistory: [new Date()],
    };

    let sellerUser = await User.findOne({ email: sellerEmail });
    if (!sellerUser) {
      sellerUser = await User.create(sellerUserData);
      console.log(`Platform seller user created: ${sellerEmail}`);
    } else {
      console.log(`Platform seller user already exists: ${sellerEmail}`);
    }

    // -------- Seller Profile --------
    const existingSellerProfile = await Seller.findOne({
      user: sellerUser._id,
    });

    if (!existingSellerProfile) {
      await Seller.create({
        user: sellerUser._id,
        storeName: "Official Bookstore",
        banner: "https://example.com/banners/platform.jpg",
        logo: "https://example.com/logos/platform_logo.png",
        bio: "Books sold directly by the bookstore platform.",
        status: "approved",
        contactEmail: "support@bookstore.com",
        contactPhone: "+1234567890",
        address: "123 Platform HQ, Book City",
      });

      console.log("Platform seller profile created and approved.");
    } else {
      console.log("Platform seller profile already exists.");
    }

    console.log("\nAccount summary:");
    console.log(`Admin: ${adminEmail} | Password: ${adminPassword}`);
    console.log(
      `Platform Seller: ${sellerEmail} | Password: ${sellerPassword}`
    );

    await mongoose.disconnect();
    console.log("\nDisconnected from database");
  } catch (err) {
    console.error("Error setting up accounts:", err.message);
    process.exit(1);
  }
}

// Run
createAdminAndPlatformSeller();
