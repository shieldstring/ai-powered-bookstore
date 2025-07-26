const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Follow a user
// @route   PUT /api/users/follow/:id
// @access  Private
exports.followUser = async (req, res) => {
  try {
    const userIdToFollow = req.params.id;
    const currentUserId = req.user._id;

    if (userIdToFollow === currentUserId.toString()) {
      return res.status(400).json({ msg: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(userIdToFollow);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (currentUser.following.includes(userIdToFollow)) {
      return res
        .status(400)
        .json({ msg: "You are already following this user" });
    }

    // Atomically update following/followers
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: userIdToFollow },
    });

    await User.findByIdAndUpdate(userIdToFollow, {
      $addToSet: { followers: currentUserId },
    });

    // Create notification
    await Notification.create({
      recipient: userIdToFollow,
      sender: currentUserId,
      type: "newFollower",
      entityId: currentUserId, // Referencing the user who followed
    });

    const updatedCurrent = await User.findById(currentUserId).select(
      "following"
    );
    const updatedTarget = await User.findById(userIdToFollow).select(
      "followers"
    );

    res.json({
      msg: "User followed successfully",
      followingCount: updatedCurrent.following.length,
      followersCount: updatedTarget.followers.length,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Unfollow a user
// @route   PUT /api/users/unfollow/:id
// @access  Private
exports.unfollowUser = async (req, res) => {
  try {
    const userIdToUnfollow = req.params.id;
    const currentUserId = req.user._id;

    if (userIdToUnfollow === currentUserId.toString()) {
      return res.status(400).json({ msg: "You cannot unfollow yourself" });
    }

    const userToUnfollow = await User.findById(userIdToUnfollow);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!currentUser.following.includes(userIdToUnfollow)) {
      return res.status(400).json({ msg: "You are not following this user" });
    }

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: userIdToUnfollow },
    });

    await User.findByIdAndUpdate(userIdToUnfollow, {
      $pull: { followers: currentUserId },
    });

    const updatedCurrent = await User.findById(currentUserId).select(
      "following"
    );
    const updatedTarget = await User.findById(userIdToUnfollow).select(
      "followers"
    );

    res.json({
      msg: "User unfollowed successfully",
      followingCount: updatedCurrent.following.length,
      followersCount: updatedTarget.followers.length,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get followers of a user
exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.id === "me" ? req.user._id : req.params.id;

    const user = await User.findById(userId).populate(
      "followers",
      "name email avatar"
    );

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ followers: user.followers });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get following of a user
exports.getFollowing = async (req, res) => {
  try {
    const userId = req.params.id === "me" ? req.user._id : req.params.id;

    const user = await User.findById(userId).populate(
      "following",
      "name email avatar"
    );

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ following: user.following });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Check if current user is following another user
// @route   GET /api/users/:userId/follow-status
// @access  Private
exports.checkFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.json({
        isFollowing: false,
        message: "You cannot follow yourself",
      });
    }

    const currentUser = await User.findById(currentUserId);
    const isFollowing = currentUser.following.includes(userId);

    res.json({ isFollowing });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Suggest users to follow
// @route   GET /api/users/suggested?limit=5
// @access  Private
exports.getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const limit = parseInt(req.query.limit) || 5;

    // Get current user to access their following list
    const currentUser = await User.findById(currentUserId);

    const excludeIds = [...currentUser.following, currentUserId];

    const suggestions = await User.find({
      _id: { $nin: excludeIds },
      role: "seller", // Optional: you can suggest only sellers or any role
    })
      .limit(limit)
      .select("name email role profileImage");

    res.json({ suggestions });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};
