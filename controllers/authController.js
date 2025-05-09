const User = require("../models/User");
const Transaction = require("../models/Transaction");
const MLMTier = require("../models/MLMTier");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

/**
 * Register a new user with optional referral processing
 */
const registerUser = async (req, res) => {
  const { name, email, password, referralCode } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user data object
    const userData = {
      name,
      email,
      password,
      // Generate a unique referral code for the new user
      referralCode: crypto.randomBytes(4).toString("hex"),
    };

    // Handle referral if provided
    let referrer = null;
    if (referralCode && referralCode.trim() !== "") {
      // Find the referrer by their code
      referrer = await User.findOne({ referralCode });

      if (referrer) {
        userData.referredBy = referrer._id;
      } else {
        return res.status(400).json({ message: "Invalid referral code" });
      }
    }

    // Create the new user
    const user = await User.create(userData);

    // Process referral rewards if there was a valid referrer
    if (referrer) {
      // Define referral bonus (could be moved to config or environment variables)
      const referralBonus = 10; // $10 bonus

      // Update referrer stats
      referrer.earnings = (referrer.earnings || 0) + referralBonus;
      referrer.referralCount = (referrer.referralCount || 0) + 1;
      await referrer.save();

      // Log the transaction
      await Transaction.create({
        user: referrer._id,
        amount: referralBonus,
        type: "referral",
        description: `Referral bonus for ${user.email}`,
        relatedUser: user._id,
      });

      // Update referrer's MLM tier if needed
      await updateUserMLMTier(referrer._id);

      // Process MLM commissions for the upline
      await processUplineCommissions(referrer._id, referralBonus);
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Return user data with token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Login user
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Update last login and login history
    user.lastLogin = new Date();
    user.loginHistory = user.loginHistory || [];
    user.loginHistory.push(new Date());
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode, // Include referral code in response
      referralCount: user.referralCount || 0, // Include referral count
      earnings: user.earnings || 0, // Include earnings
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Forgot password
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email with reset link
    const resetUrl = `https://ai-bookstore.vercel.app/reset-password/${resetToken}`;
    const message = `You are receiving this email because you requested a password reset. Please click the link to reset your password: ${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Reset password
 */
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update user's MLM tier based on their earnings and referral activity
 */
const updateUserMLMTier = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const mlmTiers = await MLMTier.find().sort({ tier: 1 });
    let userTier = 0;

    for (const tier of mlmTiers) {
      if (user.earnings >= tier.minEarnings) {
        userTier = tier.tier;
      } else {
        break;
      }
    }

    // Update user's tier if changed
    if (user.mlmTier !== userTier) {
      user.mlmTier = userTier;
      await user.save();

      // You could notify user of tier change here
    }

    return userTier;
  } catch (error) {
    console.error("Error updating MLM tier:", error);
  }
};

/**
 * Process commissions for all users up the referral chain
 */
const processUplineCommissions = async (userId, baseAmount) => {
  try {
    // Get current user
    let currentUser = await User.findById(userId);
    if (!currentUser || !currentUser.referredBy) return;

    // Max levels to process (prevent infinite loops and limit commission depth)
    const MAX_LEVELS = 5;
    let currentLevel = 0;

    // Process each level up the chain
    while (currentUser.referredBy && currentLevel < MAX_LEVELS) {
      const uplineUser = await User.findById(currentUser.referredBy);
      if (!uplineUser) break;

      // Get appropriate commission rate based on upline user's tier
      const mlmTier = await MLMTier.findOne({ tier: uplineUser.mlmTier || 0 });
      const commissionRate = mlmTier?.commissionRate || 0;

      // Calculate commission using level-based decay (optional)
      const levelFactor = 1 / (currentLevel + 1); // Reduces commission for each level up
      const commission = baseAmount * (commissionRate / 100) * levelFactor;

      if (commission > 0) {
        // Add commission to upline user's earnings
        uplineUser.earnings = (uplineUser.earnings || 0) + commission;
        await uplineUser.save();

        // Log the transaction
        await Transaction.create({
          user: uplineUser._id,
          amount: commission,
          type: "mlm_commission",
          description: `Level ${currentLevel + 1} commission from ${
            currentUser.email || currentUser.username
          }`,
          relatedUser: currentUser._id,
        });
      }

      // Move up the chain
      currentUser = uplineUser;
      currentLevel++;
    }
  } catch (error) {
    console.error("Error processing upline commissions:", error);
  }
};

/**
 * Get a user's referral statistics
 */
const getReferralStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get current user with referral details
    const user = await User.findById(userId).select(
      "referralCode referralCount earnings mlmTier"
    );

    // Get direct referrals
    const directReferrals = await User.find({ referredBy: userId })
      .select("name email createdAt earnings")
      .sort({ createdAt: -1 });

    // Get referral transactions
    const referralTransactions = await Transaction.find({
      user: userId,
      $or: [{ type: "referral" }, { type: "mlm_commission" }],
    }).sort({ createdAt: -1 });

    // Get current MLM tier details
    const currentTier = await MLMTier.findOne({ tier: user.mlmTier || 0 });

    // Get next MLM tier if available
    const nextTier = await MLMTier.findOne({
      minEarnings: { $gt: user.earnings || 0 },
    }).sort({ minEarnings: 1 });

    res.json({
      referralCode: user.referralCode,
      referralCount: user.referralCount || 0,
      earnings: user.earnings || 0,
      currentTier: currentTier || { tier: 0, commissionRate: 0 },
      nextTier: nextTier || null,
      directReferrals,
      transactions: referralTransactions,
      referralLink: `https://ai-bookstore.vercel.app/register?ref=${user.referralCode}`,
      earningsToNextTier: nextTier
        ? nextTier.minEarnings - (user.earnings || 0)
        : 0,
    });
  } catch (error) {
    console.error("Error getting referral stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getReferralStats,
};
