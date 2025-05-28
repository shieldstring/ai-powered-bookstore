const express = require('express');
const { blockUser, reportUser } = require('../controllers/blockReportController');

const router = express.Router();

// Block a user
router.post('/:id/block', blockUser);

// Report a user
router.post('/:id/report', reportUser);

module.exports = router;
const User = require('../models/User');

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
    if (!requestingUser.blockedUsers.includes(userIdToBlock)) {
      requestingUser.blockedUsers.push(userIdToBlock);
      await requestingUser.save();
      res.json({ message: 'User blocked successfully' });
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