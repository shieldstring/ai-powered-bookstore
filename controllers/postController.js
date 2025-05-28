const Post = require('../models/Post');

// Helper function to extract hashtags and mentions
const extractHashtagsAndMentions = (text) => {
  const hashtags = text.match(/#\w+/g) || [];
  // Regex for @[DisplayName](userID)
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({ displayName: match[1], userId: match[2] });
  }
  return { hashtags, mentions };
};

const createPost = async (req, res) => {
  try {
    const {
      content
    } = req.body;
    const userId = req.user._id; // Assuming user is authenticated and available in req.user

    if (!content || (!content.text && !content.imageUrl && !content.videoUrl)) {
      return res.status(400).json({
        message: 'Post content is required'
      });
    }

    // Extract hashtags and mentions from text content
    if (content.text) {
      const { hashtags, mentions } = extractHashtagsAndMentags(content.text);
      console.log('Extracted from post:', { hashtags, mentions });
    }

    const newPost = new Post({
      user: userId,
      content: {
        text: content.text,
        imageUrl: content.imageUrl,
        videoUrl: content.videoUrl,
      },
    });

    const post = await newPost.save();

    // Optionally populate user details in the response
    const populatedPost = await Post.findById(post._id).populate(
      'user',
      'name avatar'
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
 .populate('user', 'name avatar') // Populate user who created the post
 .populate('comments.user', 'name avatar'); // Populate user for each comment

    if (!post) {
      return res.status(404).json({
 message: 'Post not found'
      });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    res.status(500).json({
 message: 'Server error'
    });
  }
};

const getPosts = async (req, res) => {
  try {
    // Basic pagination/fetching for now - can be expanded later
    const requestedLimit = parseInt(req.query.limit) || 10;
    // Fetch more posts initially to allow for sorting by engagement
    const fetchLimit = requestedLimit * 2; // Fetch double the requested limit, adjust as needed
    const skip = parseInt(req.query.skip) || 0;

    // Get the IDs of users the current user is following
    const followedUsers = req.user.following;

    const posts = await Post.find({ isHidden: false, user: { $in: followedUsers } }) // Filter out hidden posts and show posts from followed users
 .sort({ createdAt: -1 }) // Get newest posts first (initial sort)
 .limit(fetchLimit) // Fetch more posts
 .skip(skip)
 .populate('user', 'name avatar')
 .populate('comments.user', 'name avatar');

    // Calculate engagement score and sort
    const sortedPosts = posts.sort((a, b) => {
      const engagementA = a.likes.length + a.comments.length;
      const engagementB = b.likes.length + b.comments.length;
      // Sort by engagement (descending) then recency (descending)
      return engagementB - engagementA || b.createdAt - a.createdAt;
    });

    // Return only the requested number of posts
    res.json(sortedPosts.slice(0, requestedLimit));
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
 message: 'Server error'
    });
  }
};

const likeUnlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    const likedIndex = post.likes.findIndex(
      (like) => like.toString() === userId.toString()
    );

    if (likedIndex === -1) {
      // User has not liked the post, so like it
      post.likes.push(userId);
    } else {
      // User has liked the post, so unlike it
      post.likes.splice(likedIndex, 1);
    }

    await post.save();

    res.json(post); // Or return a success message/updated like count
  } catch (error) {
    console.error('Error liking/unliking post:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
};

const addCommentToPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const {
      text
    } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        message: 'Comment text is required'
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    // Extract hashtags and mentions from comment text
    const { hashtags, mentions } = extractHashtagsAndMentions(text);
    console.log('Extracted from comment:', { hashtags, mentions });


    const newComment = {
      user: userId,
      text,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Populate user details for the returned post and comments
    const populatedPost = await Post.findById(post._id)
      .populate('user', 'name avatar')
      .populate('comments.user', 'name avatar');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error adding comment to post:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
};

const deleteCommentFromPost = async (req, res) => {
  try {
    const {
      id,
      commentId
    } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId &&
      (comment.user.toString() === userId.toString() || post.user.toString() === userId.toString()) // Allow comment owner or post owner to delete
    );

    if (commentIndex === -1) {
      // Could be comment not found or user not authorized
      const commentExists = post.comments.some(comment => comment._id.toString() === commentId);
      if (commentExists) {
        return res.status(403).json({
          message: 'Not authorized to delete this comment'
        });
      } else {
        return res.status(404).json({
          message: 'Comment not found'
        });
      }
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    // Populate user details for the returned post and comments
    const populatedPost = await Post.findById(post._id)
      .populate('user', 'name avatar')
      .populate('comments.user', 'name avatar');

    res.json(populatedPost);
  } catch (error) {
    console.error('Error deleting comment from post:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
};


module.exports = {
  createPost,
  getPostById,
  getPosts,
  likeUnlikePost,
  addCommentToPost,
  deleteCommentFromPost,
};