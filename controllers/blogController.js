const Blog = require("../models/Blog");
const mongoose = require("mongoose");

// Get all blogs (Public - with optional search, category filter, pagination)
const getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = {};

    // Only return active blogs for general users (unless logged in admin asks for drafts)
    if (!req.query.showDrafts || req.query.showDrafts !== "true") {
      filters.isActive = true;
    }

    if (req.query.category) {
      filters.category = req.query.category;
    }

    if (req.query.search) {
      filters.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { summary: { $regex: req.query.search, $options: "i" } },
        { content: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const [total, blogs] = await Promise.all([
      Blog.countDocuments(filters),
      Blog.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "name avatar email")
        .lean(),
    ]);

    res.json({
      success: true,
      count: blogs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: blogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching blogs",
      error: error.message,
    });
  }
};

// Get single blog by ID
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID format",
      });
    }

    const blog = await Blog.findById(id).populate("author", "name avatar email");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Error fetching blog details:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching blog details",
      error: error.message,
    });
  }
};

// Create a new blog (Admin only)
const createBlog = async (req, res) => {
  try {
    const { title, summary, content, imageUrl, authorName, category, readTime, isActive } = req.body;

    if (!title || !summary || !content || !imageUrl || !authorName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields for blog post creation",
      });
    }

    const blogData = {
      title,
      summary,
      content,
      imageUrl,
      author: req.user._id,
      authorName,
      category: category || "General",
      readTime: readTime || "5 min read",
      isActive: isActive !== undefined ? isActive : true,
    };

    const blog = await Blog.create(blogData);

    res.status(201).json({
      success: true,
      message: "Blog post created successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating blog post",
      error: error.message,
    });
  }
};

// Update an existing blog (Admin only)
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID format",
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Blog post updated successfully",
      data: updatedBlog,
    });
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating blog post",
      error: error.message,
    });
  }
};

// Delete a blog (Admin only)
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID format",
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    await Blog.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting blog post",
      error: error.message,
    });
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
