const Post = require('../models/Post');

// Create a new post
const createPost = async (req, res) => {
  const { content, image, video } = req.body;

  try {
    const post = await Post.create({ user: req.user._id, content, image, video });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Like a post
const likePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user already liked the post
    if (post.likes.includes(req.user._id)) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    post.likes.push(req.user._id);
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a comment to a post
const addComment = async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({ user: req.user._id, text });
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all posts (news feed)
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'name').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createPost, likePost, addComment, getPosts };