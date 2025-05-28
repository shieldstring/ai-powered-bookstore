const User = require('../models/User');

// @desc    Follow a user
// @route   PUT /api/users/follow/:id
// @access  Private
exports.followUser = async (req, res) => {
    try {
        const userIdToFollow = req.params.id;
        const currentUserId = req.user._id; // Assuming you have user information in req.user

        if (userIdToFollow === currentUserId.toString()) {
            return res.status(400).json({ msg: 'You cannot follow yourself' });
        }

        const userToFollow = await User.findById(userIdToFollow);
        const currentUser = await User.findById(currentUserId);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if already following
        if (currentUser.following.includes(userIdToFollow)) {
            return res.status(400).json({ msg: 'You are already following this user' });
        }

        // Add to following list of current user
        currentUser.following.push(userIdToFollow);
        await currentUser.save();

        // Add to followers list of user being followed
        userToFollow.followers.push(currentUserId);
        await userToFollow.save();

        res.json({ msg: 'User followed successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Unfollow a user
// @route   PUT /api/users/unfollow/:id
// @access  Private
exports.unfollowUser = async (req, res) => {
    try {
        const userIdToUnfollow = req.params.id;
        const currentUserId = req.user._id; // Assuming you have user information in req.user

        if (userIdToUnfollow === currentUserId.toString()) {
            return res.status(400).json({ msg: 'You cannot unfollow yourself' });
        }

        const userToUnfollow = await User.findById(userIdToUnfollow);
        const currentUser = await User.findById(currentUserId);

        if (!userToUnfollow || !currentUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if not following
        if (!currentUser.following.includes(userIdToUnfollow)) {
            return res.status(400).json({ msg: 'You are not following this user' });
        }

        // Remove from following list of current user
        currentUser.following = currentUser.following.filter(
            (followId) => followId.toString() !== userIdToUnfollow
        );
        await currentUser.save();

        // Remove from followers list of user being unfollowed
        userToUnfollow.followers = userToUnfollow.followers.filter(
            (followerId) => followerId.toString() !== currentUserId.toString()
        );
        await userToUnfollow.save();

        res.json({ msg: 'User unfollowed successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};