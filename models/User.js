const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const notificationPreferencesSchema = mongoose.Schema({
  groupInvite: {
    type: Boolean,
    default: true,
  },
  newDiscussion: {
    type: Boolean,
    default: true,
  },
  discussionLike: {
    type: Boolean,
    default: true,
  },
  discussionComment: {
    type: Boolean,
    default: true,
  },
  commentMention: {
    type: Boolean,
    default: true,
  },
  groupActivity: {
    type: Boolean,
    default: true,
  },
  system: {
    type: Boolean,
    default: true,
  },
  // Add notification preferences for referrals
  referralActivity: {
    type: Boolean,
    default: true,
  },
  earningsUpdates: {
    type: Boolean,
    default: true,
  },
  tierChanges: {
    type: Boolean,
    default: true,
  },
});

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    profilePicture: { type: String },
    bio: { type: String },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    tokens: { type: Number, default: 0 },

    // Referral system fields
    referralCode: {
      type: String,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    earnings: {
      type: Number,
      default: 0,
    },
    mlmTier: {
      type: Number,
      default: 0,
    },

    // Tracking fields
    lastLogin: { type: Date },
    loginHistory: [{ type: Date }],
    purchaseHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],

    // Notification fields
    fcmTokens: [
      {
        token: { type: String },
        device: { type: String },
        lastUpdated: { type: Date, default: Date.now },
      },
    ],
    notificationCount: { type: Number, default: 0 },
    notificationPreferences: {
      type: notificationPreferencesSchema,
      default: () => ({}),
    },

    // Social features fields
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Privacy settings
    isPublic: {
      type: Boolean,
      default: true,
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reports: [
      { 
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
        reason: String,
        createdAt: { type: Date, default: Date.now } // Added timestamp for reports
      },
    ],
    
    // Moderation fields
    warningCount: {
      type: Number,
      default: 0,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspensionEndDate: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Generate a unique referral code before saving if one doesn't exist
userSchema.pre("save", async function (next) {
  // Generate referral code if it doesn't exist
  if (!this.referralCode) {
    let isUnique = false;
    let code;
    
    // Keep generating until we find a unique code
    while (!isUnique) {
      // Use email and timestamp for uniqueness
      const seed = this.email + Date.now() + Math.random();
      code = crypto
        .createHash("md5")
        .update(seed)
        .digest("hex")
        .substring(0, 8);
      
      // Check if code already exists
      const existingUser = await mongoose.model("User").findOne({ referralCode: code });
      if (!existingUser) {
        isUnique = true;
      }
    }
    
    this.referralCode = code;
  }
  next();
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add indexes for frequently queried fields
userSchema.index({ name: 1 });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ referralCode: 1 }, { unique: true, sparse: true });
userSchema.index({ referredBy: 1 });
userSchema.index({ createdAt: -1 });

// Method to add/update FCM token
userSchema.methods.addFcmToken = async function (
  token,
  deviceInfo = "unknown"
) {
  // Ensure deviceInfo is a string
  let deviceString =
    typeof deviceInfo === "string" ? deviceInfo : "unknown device";

  // Check if token already exists
  const existingTokenIndex = this.fcmTokens.findIndex((t) => t.token === token);
  if (existingTokenIndex !== -1) {
    // Update existing token
    this.fcmTokens[existingTokenIndex] = {
      token,
      device: deviceString,
      lastUpdated: Date.now(),
    };
  } else {
    // Add new token
    this.fcmTokens.push({
      token,
      device: deviceString,
      lastUpdated: Date.now(),
    });
  }
  await this.save();
  return this;
};

// Remove FCM token
userSchema.methods.removeFcmToken = async function (token) {
  this.fcmTokens = this.fcmTokens.filter((t) => t.token !== token);
  await this.save();
  return this;
};

// Add a method to update the user's MLM tier
userSchema.methods.updateMLMTier = async function (tier) {
  const oldTier = this.mlmTier;
  this.mlmTier = tier;
  await this.save();
  return oldTier !== tier; // Return true if tier was changed
};

// Add a method to increase earnings
userSchema.methods.addEarnings = async function (
  amount,
  transactionType = "other",
  description = "",
  relatedUser = null
) {
  if (!amount || amount <= 0) return false;

  // Update earnings
  this.earnings += amount;
  await this.save();

  // Create transaction record if model is available
  try {
    const Transaction = mongoose.model("Transaction");
    await Transaction.create({
      user: this._id,
      amount,
      type: transactionType,
      description,
      relatedUser,
    });
    return true;
  } catch (error) {
    console.error("Error creating transaction:", error);
    return false;
  }
};

// Get user's referrals
userSchema.methods.getReferrals = async function (limit = 10, skip = 0) {
  return mongoose
    .model("User")
    .find({ referredBy: this._id })
    .select("name email profilePicture referralCount earnings createdAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Method to follow another user
userSchema.methods.followUser = async function (userIdToFollow) {
  if (this._id.toString() === userIdToFollow.toString()) {
    throw new Error("Cannot follow yourself");
  }
  
  if (!this.following.includes(userIdToFollow)) {
    this.following.push(userIdToFollow);
    await this.save();
    
    // Add this user to the other user's followers
    const userToFollow = await mongoose.model("User").findById(userIdToFollow);
    if (userToFollow && !userToFollow.followers.includes(this._id)) {
      userToFollow.followers.push(this._id);
      await userToFollow.save();
    }
  }
  return this;
};

// Method to unfollow another user
userSchema.methods.unfollowUser = async function (userIdToUnfollow) {
  this.following = this.following.filter(id => id.toString() !== userIdToUnfollow.toString());
  await this.save();
  
  // Remove this user from the other user's followers
  const userToUnfollow = await mongoose.model("User").findById(userIdToUnfollow);
  if (userToUnfollow) {
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== this._id.toString());
    await userToUnfollow.save();
  }
  
  return this;
};

// Method to block a user
userSchema.methods.blockUser = async function (userIdToBlock) {
  if (this._id.toString() === userIdToBlock.toString()) {
    throw new Error("Cannot block yourself");
  }
  
  if (!this.blockedUsers.includes(userIdToBlock)) {
    this.blockedUsers.push(userIdToBlock);
    // Remove from following/followers when blocking
    this.following = this.following.filter(id => id.toString() !== userIdToBlock.toString());
    this.followers = this.followers.filter(id => id.toString() !== userIdToBlock.toString());
    await this.save();
  }
  return this;
};

// Method to unblock a user
userSchema.methods.unblockUser = async function (userIdToUnblock) {
  this.blockedUsers = this.blockedUsers.filter(id => id.toString() !== userIdToUnblock.toString());
  await this.save();
  return this;
};

// Method to check if user is blocked
userSchema.methods.isBlocked = function (userId) {
  return this.blockedUsers.some(id => id.toString() === userId.toString());
};

module.exports = mongoose.model("User", userSchema);