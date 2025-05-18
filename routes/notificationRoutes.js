const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const { 
  getNotifications, 
  markNotificationsAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  deleteAllNotifications, 
  getUnreadCount, 
  updateNotificationPreferences,
  getNotificationPreferences,
  createNotification 
} = require("../controllers/notificationController");

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// GET routes
router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.get("/preferences", getNotificationPreferences);

// POST routes
router.post("/mark-read", markNotificationsAsRead);
router.post("/mark-all-read", markAllNotificationsAsRead);

// Admin routes
router.post("/create", admin, createNotification); // Restricted to admin

// PUT routes
router.put("/preferences", updateNotificationPreferences);

// DELETE routes
router.delete("/:id", deleteNotification);
router.delete("/", deleteAllNotifications);

module.exports = router;