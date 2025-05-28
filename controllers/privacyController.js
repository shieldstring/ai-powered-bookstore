const User = require('../models/User');

// Block a user
const blockUser = async (req, res) => {
  try {
    const userIdToBlock = req.params.id;
    const blockingUserId = req.user._id;

    if (userIdToBlock === blockingUserId.toString()) {
      return res.status(400).json({ message: "You cannot block yourself." });
    }

    const userToBlock = await User.findById(userIdToBlock);
    const blockingUser = await User.findById(blockingUserId);

    if (!userToBlock || !blockingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Add userToBlock to blockingUser's blockedUsers list
    if (!blockingUser.blockedUsers.includes(userIdToBlock)) {
      blockingUser.blockedUsers.push(userIdToBlock);
      await blockingUser.save();
    }

    // Optionally, you might want to remove follow relationships here as well

    res.json({ message: "User blocked successfully." });
  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Report a user
const reportUser = async (req, res) => {
  try {
    const userIdToReport = req.params.id;
    const reportingUserId = req.user._id;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Reason for reporting is required." });
    }

    if (userIdToReport === reportingUserId.toString()) {
      return res.status(400).json({ message: "You cannot report yourself." });
    }

    const userToReport = await User.findById(userIdToReport);
    const reportingUser = await User.findById(reportingUserId);


    if (!userToReport || !reportingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Add report to userToReport's reports array
    userToReport.reports.push({ reportedBy: reportingUserId, reason });
    await userToReport.save();

    res.json({ message: "User reported successfully." });
  } catch (error) {
    console.error("Error reporting user:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  blockUser,
  reportUser,
};