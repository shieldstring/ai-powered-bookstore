const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Function to generate referral code
function generateReferralCode() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

async function createUsers() {
  try {
    // Connect to database
    await connectDB();

    // Hash passwords
    const adminPassword = "securepassword123";
    const userPassword = "userpassword123";

    // Sample user data
    const userData = [
      {
        name: "Admin User",
        email: "admin@example.com",
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
      },
      {
        name: "John Doe",
        email: "john@example.com",
        password: userPassword,
        role: "user",
        profilePicture: "https://example.com/avatars/john.jpg",
        bio: "Avid reader and book collector",
        level: 3,
        xp: 450,
        tokens: 25,
        referralCode: generateReferralCode(),
        earnings: 12.5,
        lastLogin: new Date(),
        loginHistory: [new Date()],
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: userPassword,
        role: "user",
        profilePicture: "https://example.com/avatars/jane.jpg",
        bio: "Sci-fi enthusiast and aspiring writer",
        level: 5,
        xp: 950,
        tokens: 75,
        referralCode: generateReferralCode(),
        earnings: 30.75,
        lastLogin: new Date(),
        loginHistory: [new Date()],
      },
    ];

    // Create referral connections
    // Jane was referred by John
    userData[2].referredBy = null; // Will be set after users are created

    // Ensure unique referral codes
    const referralCodes = new Set();
    userData.forEach((user) => {
      while (referralCodes.has(user.referralCode)) {
        user.referralCode = generateReferralCode();
      }
      referralCodes.add(user.referralCode);
    });

    // Check for existing users and insert only new ones
    const createdUsers = {};

    for (const user of userData) {
      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        const newUser = await User.create(user);
        console.log(
          `User created: ${user.name} (${user.email}) - Referral Code: ${user.referralCode}`
        );
        createdUsers[user.email] = newUser;
      } else {
        console.log(`User already exists: ${user.email}`);
        createdUsers[user.email] = existingUser;
      }
    }

    // Set up referral relationships
    if (createdUsers["jane@example.com"] && createdUsers["john@example.com"]) {
      await User.findByIdAndUpdate(createdUsers["jane@example.com"]._id, {
        referredBy: createdUsers["john@example.com"]._id,
      });
      console.log("Set up referral relationship: Jane was referred by John");
    }

    console.log("\nUser accounts summary:");
    console.log("Admin email: admin@example.com, Password: securepassword123");
    console.log("Regular users password: userpassword123");

    // Disconnect from database
    await mongoose.disconnect();
    console.log("\nDisconnected from database");
  } catch (error) {
    console.error("Error creating users:", error.message);
    process.exit(1);
  }
}

// Run the function
createUsers();
