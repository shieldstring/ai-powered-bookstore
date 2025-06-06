const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getUserProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  updateFcmToken,
  warnUser,
  suspendUser,
  removeFcmToken,
  getFcmTokens,
} = require("../controllers/userController");
const { getReferralStats } = require("../controllers/authController");

const router = express.Router();

// User profile routes
router.get("/profile", protect, getUserProfile); // Get the logged-in user's profile
router.put("/profile", protect, updateProfile); // Update user profile
// Referral routes
router.get("/referral-stats", protect, getReferralStats);
// Admin routes
router.get("/", protect, admin, getAllUsers); // Get all users (admin only)
router.get("/:id", protect, admin, getUserById); // Get a single user by ID (admin only)
router.put("/:id/role", protect, admin, updateUserRole); // Update a user's role (admin only)
router.delete("/:id", protect, admin, deleteUser); // Delete a user (admin only)
// Moderator actions on users (Admin/Moderator access only)
router.put("/:id/warn", protect, admin, warnUser); // Warn a user
router.put("/:id/suspend", protect, admin, suspendUser); // Suspend a user

// Notification routes
router.post("/fcm-tokens", protect, updateFcmToken);
router.delete("/fcm-tokens", protect, removeFcmToken);
router.get("/fcm-tokens", protect, getFcmTokens);

module.exports = router;
