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
  deleteDiscussion,
  likeDiscussion,
  unlikeDiscussion,
  addCommentToDiscussion,
  deleteComment,
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

// Discussion interaction routes
router.post("/discussions/:discussionId/like", protect, likeDiscussion); // Like a discussion
router.delete("/discussions/:discussionId/like", protect, unlikeDiscussion); // Unlike a discussion
router.post(
  "/discussions/:discussionId/comments",
  protect,
  addCommentToDiscussion
); // Add comment to discussion
router.delete(
  "/discussions/:discussionId/comments/:commentId",
  protect,
  deleteComment
); // Delete a comment

module.exports = router;
