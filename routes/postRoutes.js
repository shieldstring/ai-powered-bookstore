const express = require("express");
const {
  createPost,
  getPostById,
  getPosts,
  likeUnlikePost,
  addCommentToPost,
  deleteCommentFromPost,
  likeUnlikeComment,
  replyComment,
  deletePost,
  editPost,
  reportPost,
  toggleSavePost,
  getSavedPosts,
  getReportedPosts,
} = require("../controllers/postController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Protected: Create post
router.post("/", protect, createPost);

// Public: Get post by ID
router.get("/:id", getPostById);

// Protected: Get feed/posts
router.get("/", protect, getPosts);

// Protected: DELETE Post
router.delete("/:id", protect, deletePost);

// Protected: Like/unlike post
router.put("/:id/like", protect, likeUnlikePost);

// Protected: Add comment
router.post("/:id/comments", protect, addCommentToPost);

// Protected: Delete comment
router.delete("/:postId/comments/:commentId", protect, deleteCommentFromPost);

// Protected: Like/unlike comment
router.put("/:postId/comments/:commentId/like", protect, likeUnlikeComment);

// Protected: Reply comment
router.post("/:postId/comments/:commentId/reply", protect, replyComment);

router.put("/:id", protect, editPost); // Edit post
router.post("/:id/report", protect, reportPost); // Report post
router.post("/:id/save", protect, toggleSavePost); // Save/unsave
router.get("/saved/all", protect, getSavedPosts); // Get saved posts
router.get("/admin/reported", protect, admin, getReportedPosts); // view for reported posts

module.exports = router;
