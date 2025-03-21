const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getUserProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

router.get("/profile", protect, getUserProfile); // Get the logged-in user's profile
router.put("/profile", protect, updateProfile); // Update user profile
router.get("/", protect, admin, getAllUsers); // Get all users (admin only)
router.get("/:id", protect, admin, getUserById); // Get a single user by ID (admin only)
router.put("/:id/role", protect, admin, updateUserRole); // Update a user's role (admin only)
router.delete("/:id", protect, admin, deleteUser); // Delete a user (admin only)

module.exports = router;
