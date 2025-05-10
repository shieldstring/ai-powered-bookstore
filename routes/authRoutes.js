const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const User = require("../models/User"); // Import User model

const router = express.Router();

// Regular authentication routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Generate JWT token after successful Google authentication
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Build user info object
    const userInfo = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      profilePicture: req.user.profilePicture || "",
      token,
    };

    // Redirect to frontend with token in URL
    const clientURL =
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL || "https://ai-bookstore.vercel.app/"
        : "http://localhost:3000";

    // Encode the user info as a base64 string to avoid issues with URL characters
    const userInfoBase64 = Buffer.from(JSON.stringify(userInfo)).toString(
      "base64"
    );

    res.redirect(`${clientURL}/oauth-callback?data=${userInfoBase64}`);
  }
);

// Route to check if user is authenticated via Google
router.get("/check-google-auth-status", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    profilePicture: req.user.profilePicture || "",
    token,
  });
});

module.exports = router;
