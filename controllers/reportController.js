const Report = require('../models/Report');
const Post = require('../models/Post'); // Import Post model

const createReport = async (req, res) => {
  try {
    const {
      reportType,
      reportedContent, // ID of the content being reported (post, comment, or user)
      reason
    } = req.body;
    const reporter = req.user._id; // Assuming the authenticated user's ID is in req.user._id

    if (!reportType || !reportedContent || !reason) {
      return res.status(400).json({
        message: 'Report type, reported content ID, and reason are required'
      });
    }

    // Optional: Add validation to check if reportedContent ID is a valid ObjectId

    const newReport = new Report({
      reporter,
      reportType,
      reportedContent,
      reason,
      status: 'pending', // Default status
    });

    const report = await newReport.save();

    res.status(201).json({
      message: 'Report submitted successfully',
      report
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
};

// Get reports (Admin/Moderator only)
// Get reports (Admin/Moderator only)
const getReports = async (req, res) => {
  try {
    const { status, reportType, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (reportType) {
      filter.reportType = reportType;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reports = await Report.find(filter)
      .sort(sort)
      .populate('reporter', 'name avatar') // Populate reporter details
      // Consider populating reportedContent based on reportType if needed
      .lean();

    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
};

// Update report status (Admin/Moderator only)
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: 'New status is required'
      });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        message: 'Report not found'
      });
    }

    report.status = status;
    await report.save();

    res.json(report);
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
};

// Hide a reported post (Admin/Moderator only)
const hidePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    post.isHidden = true; // Assuming you add an isHidden field to the Post model
    await post.save();

    res.json({ message: 'Post hidden successfully', post });
  } catch (error) {
    console.error('Error hiding post:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
};

// Delete a reported comment (Admin/Moderator only)
const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    const commentIndex = post.comments.findIndex(comment => comment._id.toString() === commentId);

    if (commentIndex === -1) {
      return res.status(404).json({
        message: 'Comment not found'
      });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    res.json({ message: 'Comment deleted successfully', post }); // Or return updated comments array
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
};

module.exports = {
  createReport,
  getReports,
  updateReportStatus,
  hidePost,
  deleteComment,
};