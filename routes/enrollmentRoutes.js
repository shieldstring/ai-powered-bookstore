const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getMyEnrollments,
  getEnrollment,
  toggleLessonCompletion,
} = require("../controllers/enrollmentController");

const router = express.Router();

// Fetch all courses a user is enrolled in
router.get("/", protect, getMyEnrollments);

// Fetch a single course enrollment status/progress
router.get("/:courseId", protect, getEnrollment);

// Toggle completion of a lesson within a course
router.post("/:courseId/lessons/:lessonId/toggle", protect, toggleLessonCompletion);

module.exports = router;
