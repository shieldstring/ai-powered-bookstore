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
router.post("/fcm-tokens", protect, updateFcmToken); // Register/update FCM token
router.delete("/fcm-tokens", protect, removeFcmToken); // Remove FCM token
router.get("/fcm-tokens", protect, getFcmTokens); // Get FCM tokens info
router.put("/notification-preferences", protect, updateNotificationPreferences); // Update notification preferences

module.exports = router;
