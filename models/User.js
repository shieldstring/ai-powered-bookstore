const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const notificationPreferencesSchema = mongoose.Schema({
  groupInvite: { type: Boolean, default: true },
  newDiscussion: { type: Boolean, default: true },
  discussionLike: { type: Boolean, default: true },
  discussionComment: { type: Boolean, default: true },
  commentMention: { type: Boolean, default: true },
  groupActivity: { type: Boolean, default: true },
  system: { type: Boolean, default: true },
  referralActivity: { type: Boolean, default: true },
  earningsUpdates: { type: Boolean, default: true },
  tierChanges: { type: Boolean, default: true },
});

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // 👈 keep only this
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

    referralCode: { type: String },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    referralCount: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    mlmTier: { type: Number, default: 0 },

    lastLogin: { type: Date },
    loginHistory: [{ type: Date }],
    purchaseHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],

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

    savedPosts: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Post" }
    ],

    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isPublic: { type: Boolean, default: true },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reports: [
      {
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    warningCount: { type: Number, default: 0 },
    isSuspended: { type: Boolean, default: false },
    suspensionEndDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

// ===== Pre Save Hooks =====

// Generate referral code
userSchema.pre("save", async function (next) {
  if (!this.referralCode) {
    let isUnique = false;
    let code;
    while (!isUnique) {
      const seed = this.email + Date.now() + Math.random();
      code = crypto.createHash("md5").update(seed).digest("hex").substring(0, 8);
      const existingUser = await mongoose.model("User").findOne({ referralCode: code });
      if (!existingUser) isUnique = true;
    }
    this.referralCode = code;
  }
  next();
});

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ===== Instance Methods =====
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.addFcmToken = async function (token, deviceInfo = "unknown") {
  const deviceString = typeof deviceInfo === "string" ? deviceInfo : "unknown device";
  const index = this.fcmTokens.findIndex((t) => t.token === token);
  if (index !== -1) {
    this.fcmTokens[index] = { token, device: deviceString, lastUpdated: Date.now() };
  } else {
    this.fcmTokens.push({ token, device: deviceString, lastUpdated: Date.now() });
  }
  await this.save();
  return this;
};

userSchema.methods.removeFcmToken = async function (token) {
  this.fcmTokens = this.fcmTokens.filter((t) => t.token !== token);
  await this.save();
  return this;
};

userSchema.methods.updateMLMTier = async function (tier) {
  const oldTier = this.mlmTier;
  this.mlmTier = tier;
  await this.save();
  return oldTier !== tier;
};

userSchema.methods.addEarnings = async function (amount, type = "other", description = "", relatedUser = null) {
  if (!amount || amount <= 0) return false;
  this.earnings += amount;
  await this.save();
  try {
    const Transaction = mongoose.model("Transaction");
    await Transaction.create({
      user: this._id,
      amount,
      type,
      description,
      relatedUser,
    });
    return true;
  } catch (err) {
    console.error("Error creating transaction:", err);
    return false;
  }
};

userSchema.methods.getReferrals = async function (limit = 10, skip = 0) {
  return mongoose
    .model("User")
    .find({ referredBy: this._id })
    .select("name email profilePicture referralCount earnings createdAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

userSchema.methods.followUser = async function (userIdToFollow) {
  if (this._id.toString() === userIdToFollow.toString()) throw new Error("Cannot follow yourself");
  if (!this.following.includes(userIdToFollow)) {
    this.following.push(userIdToFollow);
    await this.save();
    const userToFollow = await mongoose.model("User").findById(userIdToFollow);
    if (userToFollow && !userToFollow.followers.includes(this._id)) {
      userToFollow.followers.push(this._id);
      await userToFollow.save();
    }
  }
  return this;
};

userSchema.methods.unfollowUser = async function (userIdToUnfollow) {
  this.following = this.following.filter((id) => id.toString() !== userIdToUnfollow.toString());
  await this.save();
  const userToUnfollow = await mongoose.model("User").findById(userIdToUnfollow);
  if (userToUnfollow) {
    userToUnfollow.followers = userToUnfollow.followers.filter((id) => id.toString() !== this._id.toString());
    await userToUnfollow.save();
  }
  return this;
};

userSchema.methods.blockUser = async function (userIdToBlock) {
  if (this._id.toString() === userIdToBlock.toString()) throw new Error("Cannot block yourself");
  if (!this.blockedUsers.includes(userIdToBlock)) {
    this.blockedUsers.push(userIdToBlock);
    this.following = this.following.filter((id) => id.toString() !== userIdToBlock.toString());
    this.followers = this.followers.filter((id) => id.toString() !== userIdToBlock.toString());
    await this.save();
  }
  return this;
};

userSchema.methods.unblockUser = async function (userIdToUnblock) {
  this.blockedUsers = this.blockedUsers.filter((id) => id.toString() !== userIdToUnblock.toString());
  await this.save();
  return this;
};

userSchema.methods.isBlocked = function (userId) {
  return this.blockedUsers.some((id) => id.toString() === userId.toString());
};

// ===== Indexes (no duplication) =====
userSchema.index({ name: 1 });
userSchema.index({ email: 1 }, { unique: true }); // ✅ this is the only index for email
userSchema.index({ referralCode: 1 }, { unique: true, sparse: true });
userSchema.index({ referredBy: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);
