const User = require('../models/User');
// Block a user
// Block a user
const blockUser = async (req, res) => {
  try {
    const userIdToBlock = req.params.id;
    const requestingUser = await User.findById(req.user._id);
    const userToBlock = await User.findById(userIdToBlock);

    if (!requestingUser || !userToBlock) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent blocking self
    if (requestingUser._id.equals(userToBlock._id)) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }

    // Add user to blockedUsers array if not already blocked
 if (!requestingUser.blockedUsers.some(id => id.equals(userIdToBlock))) {
      requestingUser.blockedUsers.push(userIdToBlock);
      await requestingUser.save();

 // Optionally remove existing follower/following relationships
      // Check if requesting user is following the user being blocked
      const followingIndex = requestingUser.following.findIndex(id => id.equals(userIdToBlock));
 if (followingIndex > -1) {
 requestingUser.following.splice(followingIndex, 1);
 await requestingUser.save();
 }

      // Check if the user being blocked is following the requesting user
      const followerIndex = userToBlock.following.findIndex(id => id.equals(requestingUser._id));
 if (followerIndex > -1) {
 userToBlock.following.splice(followerIndex, 1);
 await userToBlock.save();
 }

      res.json({ message: 'User blocked successfully' });
 // Handle edge case where users were following each other and you want to update follower/following lists on both sides

    } else {
      res.status(400).json({ message: 'User is already blocked' });
    }

  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unblock a user
const unblockUser = async (req, res) => {
  try {
    const userIdToUnblock = req.params.id;
    const requestingUser = await User.findById(req.user._id);

    if (!requestingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove user from blockedUsers array
    const initialLength = requestingUser.blockedUsers.length;
    requestingUser.blockedUsers = requestingUser.blockedUsers.filter(
      (id) => !id.equals(userIdToUnblock)
    );

    if (requestingUser.blockedUsers.length < initialLength) {
      await requestingUser.save();
      res.json({ message: 'User unblocked successfully' });
    } else {
      res.status(400).json({ message: 'User is not blocked' });
    }

  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Report a user
const reportUser = async (req, res) => {
  try {
    const userIdToReport = req.params.id;
    const { reason } = req.body;
    const reportingUser = await User.findById(req.user._id);
    const userToReport = await User.findById(userIdToReport);

    if (!reportingUser || !userToReport) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!reason) {
        return res.status(400).json({ message: 'Reason for reporting is required' });
    }

    // Add report to the user's reports array
    userToReport.reports.push({
      reportedBy: reportingUser._id,
      reason: reason,
    });

    await userToReport.save();

    res.json({ message: 'User reported successfully' });

  } catch (error) {
    console.error('Error reporting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  blockUser,
  unblockUser,
  reportUser,
};