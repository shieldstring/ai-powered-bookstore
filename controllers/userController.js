const User = require("../models/User");
const Group = require("../models/Group");

// Get the logged-in user's profile with groups they belong to
const getUserProfile = async (req, res) => {
  try {
    // Get user details excluding password
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find all groups where user is a member
    const userGroups = await Group.find({ members: req.user._id })
      .select("name description")
      .lean();

    // Create a response object with user details and their groups
    const response = {
      ...user.toObject(),
      groups: userGroups,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  const { name, bio, profilePicture, phone } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.profilePicture = profilePicture || user.profilePicture;
    user.phone = phone || user.phone;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude passwords
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single user by ID (admin only) with groups they belong to
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find all groups where user is a member
    const userGroups = await Group.find({ members: id })
      .select("name description")
      .lean();

    // Create a response object with user details and their groups
    const response = {
      ...user.toObject(),
      groups: userGroups,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a user's role (admin only)
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.role = role;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a user (admin only)
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Register/update FCM token for push notifications
const updateFcmToken = async (req, res) => {
  try {
    const { token, deviceInfo } = req.body;
    
    // Validate input
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }
    
    // Add or update token
    await req.user.addFcmToken(token, deviceInfo);
    
    res.json({
      message: "FCM token registered successfully",
      tokenCount: req.user.fcmTokens.length,
    });
  } catch (error) {
    console.error("Error registering FCM token:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove FCM token (for logout)
const removeFcmToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Validate input
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }
    
    // Remove token
    await req.user.removeFcmToken(token);
    
    res.json({ message: "FCM token removed successfully" });
  } catch (error) {
    console.error("Error removing FCM token:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get FCM tokens information (without exposing actual tokens)
const getFcmTokens = async (req, res) => {
  try {
    // Return device info and last used date, but not the actual tokens for security
    const tokenInfos = req.user.fcmTokens.map((t) => ({
      id: t._id,
      device: t.device,
      lastUsed: t.lastUsed,
    }));
    
    res.json(tokenInfos);
  } catch (error) {
    console.error("Error getting FCM tokens:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update notification preferences
const updateNotificationPreferences = async (req, res) => {
  try {
    const { likes, comments, groupActivity, mentions, newFollowers } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Initialize preferences if they don't exist
    if (!user.notificationPreferences) {
      user.notificationPreferences = {};
    }
    
    // Update only the provided preferences
    if (likes !== undefined) user.notificationPreferences.likes = likes;
    if (comments !== undefined) user.notificationPreferences.comments = comments;
    if (groupActivity !== undefined) user.notificationPreferences.groupActivity = groupActivity;
    if (mentions !== undefined) user.notificationPreferences.mentions = mentions;
    if (newFollowers !== undefined) user.notificationPreferences.newFollowers = newFollowers;
    
    await user.save();
    
    res.status(200).json({
      message: "Notification preferences updated",
      preferences: user.notificationPreferences,
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  updateFcmToken,
  removeFcmToken,
  getFcmTokens,
  updateNotificationPreferences,
};
