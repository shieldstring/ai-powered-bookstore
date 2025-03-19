const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createPost, likePost, addComment, getPosts } = require('../controllers/postController');

const router = express.Router();

router.post('/', protect, createPost);
router.post('/:postId/like', protect, likePost);
router.post('/:postId/comment', protect, addComment);
router.get('/', protect, getPosts);

module.exports = router;