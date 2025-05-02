const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
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
} = require("../controllers/groupController");

const router = express.Router();

// Group routes
router.post("/", protect, createGroup);
router.get("/", protect, getAllGroups); // Get all groups
router.get("/user", protect, getUserGroups); // Get groups the user belongs to
router.put("/:id", protect, editGroup); // Edit a group
router.delete("/:id", protect, deleteGroup); // Delete a group

// Discussion routes
router.post("/discussions", protect, addDiscussion);
router.get("/:groupId/discussions", protect, getDiscussions);
router.delete("/discussions/:id", protect, deleteDiscussion); // Delete a discussion

// Message routes
router.post("/:groupId/messages", protect, sendGroupMessage); // Send a message to a group
router.get("/:groupId/messages", protect, getGroupMessages); // Get messages from a group

module.exports = router;
