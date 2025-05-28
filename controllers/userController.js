const User = require("../models/User");
const Group = require("../models/Group");

// Get the logged-in user's profile with groups they belong to
const getUserProfile = async (req, res) => {
  try {
    // Get user details excluding password
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("following", "_id name profilePicture") // Populate following users
      .populate("followers", "_id name profilePicture"); // Populate followers

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
      followingCount: user.following.length, // Add following count
      followersCount: user.followers.length, // Add followers count
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
    // Ensure the user is updating their own profile
    // Check if the user is authenticated (assuming auth middleware is used)
    if (!req.user) {
 return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update basic profile fields
 user.name = name || user.name;
    user.bio = bio || user.bio;
    user.profilePicture = profilePicture || user.profilePicture;

    user.phone = phone || user.phone;

    await user.save();
    // Update isPublic if provided and is a boolean
    if (req.body.hasOwnProperty('isPublic')) {
      if (typeof req.body.isPublic === 'boolean') {
        user.isPublic = req.body.isPublic;
      }
    }
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
    const user = await User.findById(id)
      .select("-password")
      .populate("following", "_id name profilePicture") // Populate following users
      .populate("followers", "_id name profilePicture"); // Populate followers

    // Check if the requesting user is blocked by the target user
    if (user.blockedUsers.includes(req.user._id)) {
      return res.status(403).json({ message: "You are blocked by this user." });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check privacy settings
    if (!user.isPublic) {
      // If private, check if the requesting user is a follower
      if (!user.followers.some(follower => follower._id.equals(req.user._id))) {
        return res.status(403).json({ message: "This profile is private." });
      }
    }

    // Find all groups where user is a member
    const userGroups = await Group.find({ members: id })
      .select("name description")
      .lean();

    // Create a response object with user details and their groups
    const response = {
      ...user.toObject(),
      groups: userGroups,
      followingCount: user.following.length, // Add following count
      followersCount: user.followers.length, // Add followers count
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

// Warn a user (Admin/Moderator only)
const warnUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.warningCount = (user.warningCount || 0) + 1;
    await user.save();
    res.json(user);
  } catch (error) {
    console.error("Error warning user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Suspend a user (Admin/Moderator only)
const suspendUser = async (req, res) => {
  const { id } = req.params;
  const { durationInDays } = req.body; // Duration of suspension in days
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (typeof durationInDays !== 'number' || durationInDays <= 0) {
       return res.status(400).json({ message: "Valid suspension duration in days is required" });
    }

    const suspensionEndDate = new Date();
    suspensionEndDate.setDate(suspensionEndDate.getDate() + durationInDays);

    user.isSuspended = true;
    user.suspensionEndDate = suspensionEndDate;
    await user.save();

    res.json(user);
  } catch (error) {
    console.error("Error suspending user:", error);
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

    // Convert deviceInfo object to string if it's an object
    let deviceString = "unknown";
    if (deviceInfo) {
      if (typeof deviceInfo === "string") {
        deviceString = deviceInfo;
      } else {
        // Create a descriptive string from deviceInfo object
        try {
          const platform = deviceInfo.platform || "unknown platform";
          const browser = deviceInfo.userAgent
            ? deviceInfo.userAgent.split(" ")[0].split("/")[0]
            : "unknown browser";
          deviceString = `${platform} - ${browser}`;
        } catch (err) {
          console.error("Error parsing deviceInfo:", err);
          deviceString = "unknown device";
        }
      }
    }

    // Add or update token
    await req.user.addFcmToken(token, deviceString);

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
    // Return device info and last updated date, but not the actual tokens for security
    const tokenInfos = req.user.fcmTokens.map((t) => ({
      id: t._id,
      device: t.device,
      lastUsed: t.lastUpdated,
    }));

    res.json(tokenInfos);
  } catch (error) {
    console.error("Error getting FCM tokens:", error);
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
  warnUser,
  suspendUser,
};
