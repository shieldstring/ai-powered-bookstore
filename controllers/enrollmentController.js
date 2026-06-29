const Enrollment = require("../models/Enrollment");
const Book = require("../models/Book");
const mongoose = require("mongoose");

// Get all enrollments of the logged-in user
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate({
        path: "course",
        select: "title author description image category rating averageRating reviews sections",
      })
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching enrollments",
      error: error.message,
    });
  }
};

// Check if user is enrolled in a specific course, and get status
const getEnrollment = async (req, res) => {
  const { courseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid course ID format",
    });
  }

  try {
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    }).populate({
      path: "course",
      select: "title author description image category sections",
    });

    if (!enrollment) {
      return res.json({
        success: true,
        enrolled: false,
      });
    }

    res.json({
      success: true,
      enrolled: true,
      data: enrollment,
    });
  } catch (error) {
    console.error("Error checking enrollment:", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking enrollment",
      error: error.message,
    });
  }
};

// Toggle completion status of a lesson in an enrollment
const toggleLessonCompletion = async (req, res) => {
  const { courseId, lessonId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid course ID format",
    });
  }

  try {
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    const course = await Book.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Toggle logic
    const lessonIndex = enrollment.completedLessons.indexOf(lessonId);
    if (lessonIndex > -1) {
      // Lesson is currently completed, mark it as incomplete
      enrollment.completedLessons.splice(lessonIndex, 1);
    } else {
      // Lesson is not completed, mark it as completed
      enrollment.completedLessons.push(lessonId);
    }

    // Calculate total lessons in course
    let totalLessons = 0;
    if (course.sections && course.sections.length > 0) {
      course.sections.forEach((section) => {
        if (section.lessons && section.lessons.length > 0) {
          totalLessons += section.lessons.length;
        }
      });
    }

    // Update completed flag
    enrollment.completed =
      totalLessons > 0 && enrollment.completedLessons.length === totalLessons;

    await enrollment.save();

    res.json({
      success: true,
      message: "Lesson completion updated",
      data: enrollment,
    });
  } catch (error) {
    console.error("Error toggling lesson completion:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating lesson completion",
      error: error.message,
    });
  }
};

module.exports = {
  getMyEnrollments,
  getEnrollment,
  toggleLessonCompletion,
};
