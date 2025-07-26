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
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
  getSuggestedUsers,
} = require("../controllers/followController");

const router = express.Router();

// Profile
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateProfile);

// Referral
router.get("/referral-stats", protect, getReferralStats);

// Notifications
router.post("/fcm-tokens", protect, updateFcmToken);
router.delete("/fcm-tokens", protect, removeFcmToken);
router.get("/fcm-tokens", protect, getFcmTokens);

// Follow
router.post("/:id/follow", protect, followUser);
router.post("/:id/unfollow", protect, unfollowUser);
router.get("/me/followers", protect, getFollowers);
router.get("/me/following", protect, getFollowing);
router.get("/:userId/follow-status", protect, checkFollowStatus);
router.get("/suggested", protect, getSuggestedUsers);

// Admin actions (keep these after more specific routes)
router.get("/", protect, admin, getAllUsers);
router.get("/:id", protect, admin, getUserById);
router.put("/:id/role", protect, admin, updateUserRole);
router.delete("/:id", protect, admin, deleteUser);
router.put("/:id/warn", protect, admin, warnUser);
router.put("/:id/suspend", protect, admin, suspendUser);

// Followers/Following by ID (optional; less used than /me routes)
router.get("/:id/followers", protect, getFollowers);
router.get("/:id/following", protect, getFollowing);


module.exports = router;
