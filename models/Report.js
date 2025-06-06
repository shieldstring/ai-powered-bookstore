const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reportType: {
    type: String,
    enum: ['post', 'comment', 'user', 'spam', 'hate speech', 'nudity', 'harassment'],
    required: true,
  },
  reportedContent: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true, // Index for efficient lookup of reports on specific content
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  resolution: {
    type: String,
  },
});

const Report = mongoose.model('Report', ReportSchema);

module.exports = Report;