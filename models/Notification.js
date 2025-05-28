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
    }, // e.g., "newMessage", "newLike", "newFollower"
    read: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date
    },
    message: {
      type: String, // This field is not in the new schema, removing it
      required: true // This field is not in the new schema, removing it
    }, // This field is not in the new schema, removing it
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries (Keeping relevant indexes, removing those tied to removed fields)
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

// Create a TTL index to automatically delete old notifications after 30 days (Keeping this)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;