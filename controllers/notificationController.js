const Notification = require("../models/Notification");
const User = require("../models/User");
const mongoose = require("mongoose");
const NotificationService = require("../notificationService");

/**
 * Get all notifications for the current user
 */
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate("sender", "name avatar")
      .populate("group", "name")
      .populate("discussion", "message");

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Mark notifications as read
 */
const markNotificationsAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    // Validate input
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ message: "Invalid notification IDs" });
    }
    
    // Ensure all IDs are valid ObjectIDs
    const validIds = notificationIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    // Update notifications as read
    const result = await Notification.updateMany(
      { 
        _id: { $in: validIds },
        recipient: req.user._id // Security: only update user's own notifications
      },
      { $set: { read: true, readAt: new Date() } }
    );
    
    // Also reset the notification counter in the user model
    await User.findByIdAndUpdate(req.user._id, {
      notificationCount: 0
    });
    
    res.json({ 
      message: "Notifications marked as read",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Mark all notifications as read
 */
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    // Reset the notification counter in the user model
    await User.findByIdAndUpdate(req.user._id, {
      notificationCount: 0
    });
    
    res.json({ 
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete a specific notification
 */
const deleteNotification = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Validate notification ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }
    
    // Delete notification and ensure it belongs to the current user
    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete all notifications for the current user
 */
const deleteAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({ recipient: req.user._id });
    
    // Reset the notification counter in the user model
    await User.findByIdAndUpdate(req.user._id, {
      notificationCount: 0
    });
    
    res.json({ 
      message: "All notifications deleted successfully",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      recipient: req.user._id,
      read: false
    });
    
    res.json({ count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update notification preferences
 */
const updateNotificationPreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    
    // Validate input
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ message: "Invalid preferences" });
    }
    
    // Update user preferences
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { notificationPreferences: preferences } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ 
      message: "Notification preferences updated",
      preferences: user.notificationPreferences
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Create a new notification (mainly for testing or admin use)
 */
const createNotification = async (req, res) => {
  try {
    const { recipientId, type, message, data } = req.body;
    
    // Validate input
    if (!recipientId || !type || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Create notification in database
    const notification = await Notification.create({
      recipient: recipientId,
      sender: req.user._id,
      type,
      message,
      data: data || {},
      read: false
    });
    
    // Send push notification
    await NotificationService.sendPushNotification(
      recipientId,
      message,
      {
        title: type.charAt(0).toUpperCase() + type.slice(1),
        type,
        data: data || {}
      }
    );
    
    // Increment recipient's notification count
    await User.findByIdAndUpdate(recipientId, {
      $inc: { notificationCount: 1 }
    });
    
    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getNotifications,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  updateNotificationPreferences,
  createNotification
};