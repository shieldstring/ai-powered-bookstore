const express = require('express');
const {
  createPost,
  getPostById,
  getPosts,
  likeUnlikePost,
  addCommentToPost,
  deleteCommentFromPost,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');



const router = express.Router();

// Protected: Create post
router.post('/', protect, createPost);

// Public: Get post by ID
router.get('/:id', getPostById);

// Protected: Get feed/posts
router.get('/', protect, getPosts);

// Protected: Like/unlike post
router.put('/:id/like', protect, likeUnlikePost);

// Protected: Add comment
router.post('/:id/comments', protect, addCommentToPost);

// Protected: Delete comment
router.delete('/:postId/comments/:commentId', protect, deleteCommentFromPost);

module.exports = router;
