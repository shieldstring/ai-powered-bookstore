const Book = require("../models/Book");
const mongoose = require("mongoose");
const { applyCurrencyToBook, applyCurrencyToBooks, normalizeCurrency } = require("../utils/currency");
const { resolveProductSeller } = require("../utils/resolveProductSeller");

// Helper function for pagination
const getPaginationOptions = (query) => ({
  page: parseInt(query.page) || 1,
  limit: parseInt(query.limit) || 10,
  sort: query.sort || "-createdAt",
});

// Get all courses (public view)
const getCourses = async (req, res) => {
  try {
    const { page, limit, sort } = getPaginationOptions(req.query);
    const skip = (page - 1) * limit;

    // Force format to be Course
    const filters = {
      format: "Course",
      isActive: true,
      ...(req.query.keyword && {
        $text: { $search: req.query.keyword },
      }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.author && { author: req.query.author }),
    };

    let sortOption = {};
    switch (sort) {
      case "price-asc":
        sortOption = { price: 1 };
        break;
      case "price-desc":
        sortOption = { price: -1 };
        break;
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "title-asc":
        sortOption = { title: 1 };
        break;
      case "rating":
        sortOption = { averageRating: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const currency = normalizeCurrency(req.query.currency);

    const [total, courses] = await Promise.all([
      Book.countDocuments(filters),
      Book.find(filters)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .select("-reviews -salesHistory -__v")
        .lean(),
    ]);

    res.json({
      success: true,
      count: courses.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      currency,
      data: applyCurrencyToBooks(courses, currency),
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching courses",
      error: error.message,
    });
  }
};

// Get a single course by ID
const getCourseById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format",
      });
    }

    const course = await Book.findOne({ _id: req.params.id, format: "Course" })
      .populate("reviews.user", "name avatar");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const currency = normalizeCurrency(req.query.currency);
    const courseData = applyCurrencyToBook(course.toObject(), currency);

    res.json({
      success: true,
      currency,
      data: courseData,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching course details",
      error: error.message,
    });
  }
};

// Get courses belonging to current seller
const getSellerCourses = async (req, res) => {
  try {
    if (req.user.role !== "seller" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only sellers or administrators can manage seller courses",
      });
    }

    const query = {
      format: "Course",
      isActive: true,
    };

    // If seller, filter by their own ID
    if (req.user.role === "seller") {
      query.seller = req.user._id;
    }

    const courses = await Book.find(query).lean();

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error("Error fetching seller courses:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Add a new course
const addCourse = async (req, res) => {
  try {
    if (!["admin", "seller"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only admins and sellers can create courses",
      });
    }

    const { title, author, price, category, image, sections } = req.body;

    if (!title || !author || !price || !category || !image) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields for course creation",
      });
    }

    // Generate unique ISBN for courses
    const isbn = `COURSE-${Date.now()}`;
    const seller = await resolveProductSeller(req);
    const { seller: _ignoredSeller, isbn: _ignoredIsbn, ...body } = req.body;

    const courseData = {
      ...body,
      format: "Course",
      isbn,
      seller,
      inventory: 99999,
      isActive: true,
    };

    const course = await Book.create(courseData);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update course details
const updateCourse = async (req, res) => {
  try {
    if (!["admin", "seller"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only admins and sellers can update courses",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Book.findById(id);
    if (!course || course.format !== "Course") {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Verify ownership
    if (
      req.user.role === "seller" &&
      course.seller?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this course",
      });
    }

    const { seller: _ignoredSeller, isbn: _ignoredIsbn, ...body } = req.body;

    const updateData = {
      ...body,
      format: "Course",
      inventory: 99999,
      isActive: true,
      updatedAt: new Date(),
    };

    if (!course.seller) {
      updateData.seller = await resolveProductSeller(req);
    }

    const updatedCourse = await Book.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete course (mark inactive or remove)
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Book.findById(id);
    if (!course || course.format !== "Course") {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Verify ownership
    if (
      req.user.role === "seller" &&
      course.seller?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this course",
      });
    }

    // Perform soft delete by setting isActive to false
    course.isActive = false;
    await course.save();

    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  getSellerCourses,
  addCourse,
  updateCourse,
  deleteCourse,
};
