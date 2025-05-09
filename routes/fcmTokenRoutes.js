const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

/**
 * Register FCM token for the logged-in user
 */
router.post("/register", protect, async (req, res) => {
  try {
    const { token, deviceInfo } = req.body;
    
    // Validate input
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }
    
    // Add or update token
    await req.user.addFcmToken(token, deviceInfo);
    
    res.json({ message: "FCM token registered successfully" });
  } catch (error) {
    console.error("Error registering FCM token:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Unregister FCM token
 */
router.post("/unregister", protect, async (req, res) => {
  try {
    const { token } = req.body;
    
    // Validate input
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }
    
    // Remove token
    await req.user.removeFcmToken(token);
    
    res.json({ message: "FCM token unregistered successfully" });
  } catch (error) {
    console.error("Error unregistering FCM token:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Get all registered FCM tokens for the user
 */
router.get("/", protect, async (req, res) => {
  try {
    // Return device info and last used date, but not the actual tokens for security
    const tokenInfos = req.user.fcmTokens.map(t => ({
      id: t._id,
      device: t.device,
      lastUsed: t.lastUsed
    }));
    
    res.json(tokenInfos);
  } catch (error) {
    console.error("Error getting FCM tokens:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;