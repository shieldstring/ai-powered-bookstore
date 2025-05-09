const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
});

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" }, // User roles
    profilePicture: { type: String }, // Profile picture URL
    bio: { type: String }, // User bio
    level: { type: Number, default: 1 }, // User level
    xp: { type: Number, default: 0 }, // Experience points
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    tokens: { type: Number, default: 0 },
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    earnings: { type: Number, default: 0 },
    lastLogin: { type: Date }, // Track last login
    loginHistory: [{ type: Date }], // Track login history
    purchaseHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }], // Track purchases
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
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add indexes for frequently queried fields
userSchema.index({ name: 1 }); // Index for name

// Method to add/update FCM token
userSchema.methods.addFcmToken = async function (
  token,
  deviceInfo = "unknown"
) {
  // Check if token already exists
  const existingTokenIndex = this.fcmTokens.findIndex((t) => t.token === token);

  if (existingTokenIndex !== -1) {
    // Update existing token
    this.fcmTokens[existingTokenIndex] = {
      token,
      device: deviceInfo,
      lastUsed: Date.now(),
    };
  } else {
    // Add new token
    this.fcmTokens.push({
      token,
      device: deviceInfo,
      lastUsed: Date.now(),
    });
  }

  await this.save();
};

userSchema.methods.removeFcmToken = async function (token) {
  this.fcmTokens = this.fcmTokens.filter((t) => t.token !== token);
  await this.save();
};

module.exports = mongoose.model("User", userSchema);
