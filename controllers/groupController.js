const Group = require("../models/Group");
const Discussion = require("../models/Discussion");
const Message = require("../models/Message");

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
    const groups = await Group.find({}).populate("members", "name");
    res.json(groups);
  } catch (error) {
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

// Add a discussion to a group
const addDiscussion = async (req, res) => {
  const { groupId, message } = req.body;

  try {
    const discussion = await Discussion.create({
      group: groupId,
      user: req.user._id,
      message,
    });
    res.status(201).json(discussion);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get discussions for a group
const getDiscussions = async (req, res) => {
  const { groupId } = req.params;

  try {
    const discussions = await Discussion.find({ group: groupId }).populate(
      "user",
      "name"
    );
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

// Send a message to a group
const sendGroupMessage = async (req, res) => {
  const { groupId, content } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const message = await Message.create({
      sender: req.user._id,
      group: groupId,
      content,
    });
    res.status(201).json(message);

    // Emit the message to the group via Socket.IO
    req.io
      .to(groupId)
      .emit("receiveGroupMessage", { userId: req.user._id, message: content });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get messages from a group
const getGroupMessages = async (req, res) => {
  const { groupId } = req.params;

  try {
    const messages = await Message.find({ group: groupId }).populate(
      "sender",
      "name"
    );
    res.json(messages);
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
  sendGroupMessage,
  getGroupMessages,
  deleteDiscussion,
};
