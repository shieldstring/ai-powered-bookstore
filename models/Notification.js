const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    type: {
      type: String,
      required: true,
      enum: [
        "groupInvite", 
        "newDiscussion", 
        "commentMention", 
        "discussionLike", 
        "discussionComment",
        "groupActivity",
        "system",
        "other"
      ]
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date
    },
    message: {
      type: String,
      required: true
    },
    // Reference to relevant entities
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group"
    },
    discussion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion"
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId
    },
    // Additional data as needed
    data: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

// Create a TTL index to automatically delete old notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;