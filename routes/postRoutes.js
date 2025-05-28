const express = require('express');
const { createPost, getPostById, getPosts, likeUnlikePost, addCommentToPost, deleteCommentFromPost } = require('../controllers/postController');

const router = express.Router();

// POST /api/posts
router.post('/', createPost);

// GET /api/posts/:id
router.get('/:id', getPostById);

// GET /api/posts
router.get('/', getPosts);

// PUT /api/posts/:id/like (or POST, PUT is common for updates)
router.put('/:id/like', likeUnlikePost);

// POST /api/posts/:id/comments
router.post('/:id/comments', addCommentToPost);

// DELETE /api/posts/:postId/comments/:commentId
router.delete('/:postId/comments/:commentId', deleteCommentFromPost);

module.exports = router;