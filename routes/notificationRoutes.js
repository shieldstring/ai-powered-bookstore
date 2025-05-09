const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getNotifications,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  updateNotificationPreferences,
  createNotification
} = require("../controllers/notificationController");

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// GET routes
router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);

// POST routes
router.post("/mark-read", markNotificationsAsRead);
router.post("/mark-all-read", markAllNotificationsAsRead);
router.post("/create", createNotification); // For admin/testing purposes

// PUT routes
router.put("/preferences", updateNotificationPreferences);

// DELETE routes
router.delete("/:id", deleteNotification);
router.delete("/", deleteAllNotifications);

module.exports = router;