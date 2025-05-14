const Group = require("../models/Group");
const Discussion = require("../models/Discussion");
const User = require("../models/User");
const admin = require("../firebase");
const Notification = require("../models/Notification");
const NotificationService = require("../notificationService");

// Helper function to create a notification
const createNotification = async (
  recipientId,
  senderId,
  type,
  message,
  data = {}
) => {
  try {
    // Create notification in database
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
      ...data,
      read: false,
    });

    // Increment notification count for recipient
    await User.findByIdAndUpdate(recipientId, {
      $inc: { notificationCount: 1 },
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

// Send a push notification
const sendPushNotification = async (userId, message) => {
  const user = await User.findById(userId);
  if (user && user.fcmToken) {
    await admin.messaging().send({
      token: user.fcmToken,
      notification: {
        title: "New Activity",
        body: message,
      },
    });
  }
};

// Create a new group
const createGroup = async (req, res) => {
  const { name, description } = req.body;
  try {
    const group = await Group.create({
      name,
      description,
      members: [req.user._id],
    });
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all groups
const getAllGroups = async (req, res) => {
  try {
    // Get user ID from the authenticated request
    const userId = req.user._id;
    
    // Find all groups and populate members
    const groups = await Group.find({}).populate("members", "name");
    
    // Add isMember field to each group
    const groupsWithMembership = groups.map(group => {
      // Convert to plain object so we can add properties
      const groupObj = group.toObject();
      
      // Check if the current user is a member of this group
      groupObj.isMember = group.members.some(member => member._id.toString() === userId.toString());
      
      return groupObj;
    });
    
    res.json(groupsWithMembership);
  } catch (error) {
    console.error("Error getting all groups:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get groups a user belongs to
const getUserGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id }).populate(
      "members",
      "name"
    );
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Edit a group
const editGroup = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const group = await Group.findByIdAndUpdate(
      id,
      { name, description },
      { new: true } // Return the updated group
    );
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a group
const deleteGroup = async (req, res) => {
  const { id } = req.params;
  try {
    const group = await Group.findByIdAndDelete(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Join a group
const joinGroup = async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    // Check if user is already a member
    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: "You are already a member of this group" });
    }
    
    // Add user to group members
    group.members.push(req.user._id);
    await group.save();
    
    // Get group owner to notify them
    const populatedGroup = await Group.findById(groupId).populate("members", "name");
    
    // Identify group owner (assuming first member is the owner)
    const ownerId = populatedGroup.members[0]._id;
    
    if (ownerId.toString() !== req.user._id.toString()) {
      try {
        // Create database notification for group owner
        await createNotification(
          ownerId,
          req.user._id,
          "groupJoin",
          `${req.user.name || "Someone"} joined your group "${group.name}"`,
          {
            group: groupId
          }
        );
      } catch (notificationError) {
        console.error("Error creating join notification:", notificationError);
      }
      
      try {
        // Send push notification to group owner
        await NotificationService.sendPushNotification(
          ownerId,
          `${req.user.name || "Someone"} joined your group "${group.name}"`,
          {
            title: "New Group Member",
            type: "groupJoin",
            data: {
              groupId: groupId
            }
          }
        );
      } catch (pushError) {
        console.error("Error sending push notification:", pushError);
      }
    }
    
    res.json(populatedGroup);
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Leave a group
const leaveGroup = async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    // Check if user is a member
    if (!group.members.some(member => member.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: "You are not a member of this group" });
    }
    
    // Check if user is the only member (possibly the owner)
    if (group.members.length === 1 && group.members[0].toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        message: "You are the only member of this group. Please delete the group instead of leaving."
      });
    }
    
    // Remove user from group members
    group.members = group.members.filter(
      member => member.toString() !== req.user._id.toString()
    );
    await group.save();
    
    // Get group owner to notify them (assuming first member is the owner)
    const populatedGroup = await Group.findById(groupId).populate("members", "name");
    const ownerId = populatedGroup.members[0]._id;
    
    if (ownerId.toString() !== req.user._id.toString()) {
      // Create database notification for group owner
      await createNotification(
        ownerId,
        req.user._id,
        "groupLeave",
        `${req.user.name || "Someone"} left your group "${group.name}"`,
        {
          group: groupId
        }
      );
      
      // Send push notification to group owner
      await NotificationService.sendPushNotification(
        ownerId,
        `${req.user.name || "Someone"} left your group "${group.name}"`,
        {
          title: "Group Member Left",
          type: "groupLeave",
          data: {
            groupId: groupId
          }
        }
      );
      
    }
    
    res.json({ message: "Successfully left the group" });
  } catch (error) {
    console.error("Error leaving group:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get group details
const getGroupDetails = async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await Group.findById(groupId)
      .populate("members", "name avatar")
      // You can add more population here if needed
      // For example, you might want to include recent discussions
      // .populate({ path: 'discussions', options: { limit: 5, sort: { createdAt: -1 } } })
    
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    // Add isMember field
    const isMember = group.members.some(
      member => member._id.toString() === req.user._id.toString()
    );
    
    // Count discussions
    const discussionCount = await Discussion.countDocuments({ group: groupId });
    
    // Add formatted response with additional useful information
    const response = {
      ...group.toObject(),
      isMember,
      memberCount: group.members.length,
      discussionCount,
      isOwner: group.members.length > 0 && 
        group.members[0]._id.toString() === req.user._id.toString()
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error getting group details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add a discussion to a group
const addDiscussion = async (req, res) => {
  const { groupId, message, image, video } = req.body;
  try {
    const discussion = await Discussion.create({
      group: groupId,
      user: req.user._id,
      message,
      image,
      video,
      likes: [],
      comments: [],
    });

    // Populate the user field to return complete data
    const populatedDiscussion = await Discussion.findById(
      discussion._id
    ).populate("user", "name avatar");

    // Get group details to notify members
    const group = await Group.findById(groupId);

    if (group) {

      // Send push notifications to group members except the poster
      await NotificationService.sendGroupNotification(
        groupId,
        `${req.user.name || "Someone"} posted in ${
          group.name
        }: ${message.substring(0, 50)}${message.length > 50 ? "..." : ""}`,
        {
          title: "New Group Discussion",
          type: "newDiscussion",
          actorId: req.user._id.toString(),
          data: {
            discussionId: discussion._id.toString(),
            groupId: groupId,
          },
        }
      );

      // Create database notifications for each member
      const memberIds = group.members
        .map((id) => id.toString())
        .filter((id) => id !== req.user._id.toString());

      for (const memberId of memberIds) {
        await createNotification(
          memberId,
          req.user._id,
          "newDiscussion",
          `${req.user.name || "Someone"} posted in ${
            group.name
          }: ${message.substring(0, 50)}${message.length > 50 ? "..." : ""}`,
          {
            group: groupId,
            discussion: discussion._id,
          }
        );
      }
    }

    res.status(201).json(populatedDiscussion);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get discussions for a group
const getDiscussions = async (req, res) => {
  const { groupId } = req.params;
  try {
    const discussions = await Discussion.find({ group: groupId })
      .populate("user", "name")
      .populate("likes", "name")
      .populate("comments.user", "name");

    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a discussion
const deleteDiscussion = async (req, res) => {
  const { id } = req.params;
  try {
    const discussion = await Discussion.findByIdAndDelete(id);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }
    res.json({ message: "Discussion deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Like a discussion
const likeDiscussion = async (req, res) => {
  const { discussionId } = req.params;
  try {
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Check if the user already liked the discussion
    if (discussion.likes.includes(req.user._id)) {
      return res.status(400).json({ message: 'Discussion already liked' });
    }
    
    discussion.likes.push(req.user._id);
    await discussion.save();
    
    // Get the group name for the notification
    const group = await Group.findById(discussion.group);
    const groupName = group ? group.name : 'a group';
    
    // Only send notification if the like is not from the discussion owner
    if (discussion.user.toString() !== req.user._id.toString()) {
      // Create database notification
      try {
        await createNotification(
          discussion.user,
          req.user._id,
          'discussionLike',
          `${req.user.name || 'Someone'} liked your post in ${groupName}`,
          {
            group: discussion.group,
            discussion: discussionId
          }
        );
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
      }
      
      // Send push notification to discussion owner
      try {
        await NotificationService.sendPushNotification(
          discussion.user, 
          `${req.user.name || 'Someone'} liked your post in ${groupName}`,
          {
            title: 'Your Post Received a Like',
            type: 'discussionLike',
            data: {
              discussionId: discussionId,
              groupId: discussion.group.toString()
            }
          }
        );
      } catch (pushError) {
        console.error("Error sending push notification:", pushError);
      }
    }
    
    // Return the updated discussion with populated fields
    const updatedDiscussion = await Discussion.findById(discussionId)
      .populate("user", "name avatar")
      .populate("likes", "name avatar")
      .populate("comments.user", "name avatar");
    
    res.json(updatedDiscussion);
  } catch (error) {
    console.error("Error in likeDiscussion:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unlike a discussion
const unlikeDiscussion = async (req, res) => {
  const { discussionId } = req.params;
  try {
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    // Check if the user has liked the discussion
    if (!discussion.likes.includes(req.user._id)) {
      return res.status(400).json({ message: "Discussion not liked yet" });
    }

    // Remove like
    discussion.likes = discussion.likes.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await discussion.save();

    // Return the updated discussion with populated fields
    const updatedDiscussion = await Discussion.findById(discussionId)
      .populate("user", "name")
      .populate("likes", "name")
      .populate("comments.user", "name");

    res.json(updatedDiscussion);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Add a comment to a discussion
const addCommentToDiscussion = async (req, res) => {
  const { discussionId } = req.params;
  const { text } = req.body;
  try {
    const discussion = await Discussion.findById(discussionId)
      .populate("user", "name");
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    const newComment = { user: req.user._id, text, createdAt: new Date() };
    discussion.comments.push(newComment);
    await discussion.save();
    
    // Get the group for notification context
    const group = await Group.findById(discussion.group);
    const groupName = group ? group.name : 'a group';
    
    // Check for @mentions in the comment
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionedName = match[1];
      const mentionedId = match[2];
      mentions.push({ name: mentionedName, id: mentionedId });
    }
    
    // Only notify if the commenter is not the discussion owner
    if (discussion.user.toString() !== req.user._id.toString()) {
      try {
        // Create database notification for discussion owner
        await createNotification(
          discussion.user,
          req.user._id,
          'discussionComment',
          `${req.user.name || 'Someone'} commented on your post in ${groupName}: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
          {
            group: discussion.group,
            discussion: discussionId
          }
        );
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
      }
      
      try {
        // Send push notification
        await NotificationService.sendPushNotification(
          discussion.user,
          `${req.user.name || 'Someone'} commented on your post in ${groupName}`,
          {
            title: 'New Comment on Your Post',
            type: 'discussionComment',
            data: {
              discussionId: discussionId,
              groupId: discussion.group.toString()
            }
          }
        );
      } catch (pushError) {
        console.error("Error sending push notification:", pushError);
      }
    }
    
    // Send notifications for @mentions
    for (const mention of mentions) {
      if (mention.id !== req.user._id.toString()) {
        try {
          // Create database notification for mentioned user
          await createNotification(
            mention.id,
            req.user._id,
            'commentMention',
            `${req.user.name || 'Someone'} mentioned you in a comment in ${groupName}`,
            {
              group: discussion.group,
              discussion: discussionId
            }
          );
        } catch (mentionError) {
          console.error("Error creating mention notification:", mentionError);
        }
        
        try {
          // Send push notification
          await NotificationService.sendPushNotification(
            mention.id,
            `${req.user.name || 'Someone'} mentioned you in a comment in ${groupName}`,
            {
              title: 'You Were Mentioned',
              type: 'commentMention',
              data: {
                discussionId: discussionId,
                groupId: discussion.group.toString()
              }
            }
          );
        } catch (pushError) {
          console.error("Error sending push notification for mention:", pushError);
        }
      }
    }
    
    // Return the updated discussion with populated fields
    const updatedDiscussion = await Discussion.findById(discussionId)
      .populate("user", "name avatar")
      .populate("likes", "name avatar")
      .populate("comments.user", "name avatar");
    
    res.json(updatedDiscussion);
  } catch (error) {
    console.error("Error in addCommentToDiscussion:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a comment from a discussion
const deleteComment = async (req, res) => {
  const { discussionId, commentId } = req.params;
  try {
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    // Find the comment index
    const commentIndex = discussion.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );

    // Check if comment exists
    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the comment owner or discussion owner
    const comment = discussion.comments[commentIndex];
    if (
      comment.user.toString() !== req.user._id.toString() &&
      discussion.user.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    // Remove the comment
    discussion.comments.splice(commentIndex, 1);
    await discussion.save();

    // Return the updated discussion with populated fields
    const updatedDiscussion = await Discussion.findById(discussionId)
      .populate("user", "name")
      .populate("likes", "name")
      .populate("comments.user", "name");

    res.json(updatedDiscussion);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createGroup,
  getAllGroups,
  getUserGroups,
  addDiscussion,
  getDiscussions,
  editGroup,
  deleteGroup,
  deleteDiscussion,
  likeDiscussion,
  unlikeDiscussion,
  addCommentToDiscussion,
  deleteComment,
  sendPushNotification,
  joinGroup,
  leaveGroup,        // Add the new function here
  getGroupDetails,   // Add the new function here
};