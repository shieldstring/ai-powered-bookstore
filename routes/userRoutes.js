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
  removeFcmToken,
  updateNotificationPreferences,
  getNotificationPreferences,
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

// Notification routes
router.post("/fcm-tokens", protect, updateFcmToken);
router.delete("/fcm-tokens", protect, removeFcmToken);
router.get("/fcm-tokens", protect, getFcmTokens);
router.get("/notification-preferences", protect, getNotificationPreferences);
router.put("/notification-preferences", protect, updateNotificationPreferences);

module.exports = router;
