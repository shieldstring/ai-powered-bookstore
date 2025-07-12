const Post = require("../models/Post");

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
    const { content } = req.body;
    const userId = req.user._id; // Assuming user is authenticated and available in req.user

    if (!content || (!content.text && !content.imageUrl && !content.videoUrl)) {
      return res.status(400).json({
        message: "Post content is required",
      });
    }

    // Extract hashtags and mentions from text content
    if (content.text) {
      const { hashtags, mentions } = extractHashtagsAndMentions(content.text); // Fixed typo: was "extractHashtagsAndMentags"
      console.log("Extracted from post:", { hashtags, mentions });
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
      "user",
      "name avatar"
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "name avatar") // Populate user who created the post
      .populate("comments.user", "name avatar"); // Populate user for each comment

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.json(post);
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const getPosts = async (req, res) => {
  try {
    console.log("=== DEBUG: Starting getPosts ===");
    console.log("User ID:", req.user?._id);
    console.log("Query params:", req.query);

    // Basic pagination/fetching for now - can be expanded later
    const requestedLimit = parseInt(req.query.limit) || 10;
    // Fetch more posts initially to allow for sorting by engagement
    const fetchLimit = requestedLimit * 2; // Fetch double the requested limit, adjust as needed
    const skip = parseInt(req.query.skip) || 0;

    console.log(
      "Pagination - requestedLimit:",
      requestedLimit,
      "fetchLimit:",
      fetchLimit,
      "skip:",
      skip
    );

    // Check if req.user exists
    if (!req.user) {
      console.log("ERROR: req.user is undefined");
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    // Get the IDs of users the current user is following
    const followedUsers = req.user.following || [];
    console.log("Following count:", followedUsers.length);
    console.log("Following users:", followedUsers);

    // Create query filter
    const queryFilter = {
      isHidden: false,
      user: { $in: [...followedUsers, req.user._id] }, // Include user's own posts
    };

    console.log("Query filter:", JSON.stringify(queryFilter, null, 2));

    // Test basic query first without populate
    console.log("Testing basic query without populate...");
    const basicPosts = await Post.find(queryFilter)
      .sort({ createdAt: -1 })
      .limit(fetchLimit)
      .skip(skip);

    console.log("Basic posts found:", basicPosts.length);

    // Now try with populate
    console.log("Executing full query with populate...");
    const posts = await Post.find(queryFilter)
      .sort({ createdAt: -1 }) // Get newest posts first (initial sort)
      .limit(fetchLimit) // Fetch more posts
      .skip(skip)
      .populate("user", "name profilePicture") // Simplified populate first
      .populate("comments.user", "name profilePicture"); // Simplified populate first

    console.log("Posts found with populate:", posts.length);

    if (posts.length === 0) {
      console.log("No posts found, returning empty array");
      return res.json([]);
    }

    // Calculate engagement score and sort
    console.log("Calculating engagement scores...");
    const sortedPosts = posts.sort((a, b) => {
      const engagementA =
        (a.likes ? a.likes.length : 0) + (a.comments ? a.comments.length : 0);
      const engagementB =
        (b.likes ? b.likes.length : 0) + (b.comments ? b.comments.length : 0);
      // Sort by engagement (descending) then recency (descending)
      return engagementB - engagementA || b.createdAt - a.createdAt;
    });

    console.log("Engagement calculation complete");

    // Return only the requested number of posts
    const finalPosts = sortedPosts.slice(0, requestedLimit);
    console.log("Returning posts:", finalPosts.length);
    console.log("=== DEBUG: getPosts completed successfully ===");

    res.json(finalPosts);
  } catch (error) {
    console.error("=== DETAILED ERROR in getPosts ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Request user:", req.user);
    console.error("Request query:", req.query);
    console.error("=== END ERROR DETAILS ===");

    res.status(500).json({
      message: "Server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
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
        message: "Post not found",
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
    console.error("Error liking/unliking post:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const addCommentToPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        message: "Comment text is required",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Extract hashtags and mentions from comment text
    const { hashtags, mentions } = extractHashtagsAndMentions(text);
    console.log("Extracted from comment:", { hashtags, mentions });

    const newComment = {
      user: userId,
      text,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Populate user details for the returned post and comments
    const populatedPost = await Post.findById(post._id)
      .populate("user", "name avatar")
      .populate("comments.user", "name avatar");

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Error adding comment to post:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const deleteCommentFromPost = async (req, res) => {
  try {
    const {
      postId, // Changed from 'id' to 'postId' to match route parameter
      commentId,
    } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId); // Changed from 'id' to 'postId'

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const commentIndex = post.comments.findIndex(
      (comment) =>
        comment._id.toString() === commentId &&
        (comment.user.toString() === userId.toString() ||
          post.user.toString() === userId.toString()) // Allow comment owner or post owner to delete
    );

    if (commentIndex === -1) {
      // Could be comment not found or user not authorized
      const commentExists = post.comments.some(
        (comment) => comment._id.toString() === commentId
      );
      if (commentExists) {
        return res.status(403).json({
          message: "Not authorized to delete this comment",
        });
      } else {
        return res.status(404).json({
          message: "Comment not found",
        });
      }
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    // Populate user details for the returned post and comments
    const populatedPost = await Post.findById(post._id)
      .populate("user", "name avatar")
      .populate("comments.user", "name avatar");

    res.json(populatedPost);
  } catch (error) {
    console.error("Error deleting comment from post:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// Like/unlike a comment
const likeUnlikeComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Initialize likes array if not present
    if (!comment.likes) comment.likes = [];

    const likedIndex = comment.likes.findIndex(
      (id) => id.toString() === userId.toString()
    );

    if (likedIndex === -1) {
      comment.likes.push(userId);
    } else {
      comment.likes.splice(likedIndex, 1);
    }

    await post.save();

    res.json({ message: "Comment like toggled", likes: comment.likes.length });
  } catch (error) {
    console.error("Error liking/unliking comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reply to a comment
const replyComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;
    const { text } = req.body;

    if (!text || text.trim() === "")
      return res.status(400).json({ message: "Reply text is required" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Initialize replies array if not present
    if (!comment.replies) comment.replies = [];

    comment.replies.push({
      user: userId,
      text,
      createdAt: new Date(),
    });

    await post.save();

    res.status(201).json({ message: "Reply added", replies: comment.replies });
  } catch (error) {
    console.error("Error replying to comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// deletePost
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Only post creator or admin can delete
    if (
      post.user.toString() !== userId.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    await post.remove();

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit Post
const editPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (
      post.user.toString() !== userId.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this post" });
    }

    post.content.text = content?.text ?? post.content.text;
    post.content.imageUrl = content?.imageUrl ?? post.content.imageUrl;
    post.content.videoUrl = content?.videoUrl ?? post.content.videoUrl;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    console.error("Error editing post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Report Post
const reportPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.reports.push({ user: userId, reason, createdAt: new Date() });
    await post.save();

    res.status(200).json({ message: "Post reported" });
  } catch (error) {
    console.error("Error reporting post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Save/Unsave Post
const toggleSavePost = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const postIndex = user.savedPosts.findIndex(
      (postId) => postId.toString() === id
    );

    if (postIndex === -1) {
      user.savedPosts.push(id);
      await user.save();
      return res.status(200).json({ message: "Post saved" });
    } else {
      user.savedPosts.splice(postIndex, 1);
      await user.save();
      return res.status(200).json({ message: "Post unsaved" });
    }
  } catch (error) {
    console.error("Error saving/unsaving post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Saved Posts
const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedPosts",
      populate: {
        path: "user",
        select: "name profilePicture",
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.savedPosts);
  } catch (error) {
    console.error("Error fetching saved posts:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getReportedPosts = async (req, res) => {
  try {
    // Only allow admin access
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized as admin" });
    }

    const posts = await Post.find({ "reports.0": { $exists: true } })
      .populate("user", "name profilePicture")
      .populate("reports.user", "name profilePicture")
      .sort({ "reports.createdAt": -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching reported posts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
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
};
