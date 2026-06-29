const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getCourses,
  getCourseById,
  getSellerCourses,
  addCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");

const router = express.Router();

// Public routes
router.get("/", getCourses);
router.get("/:id", getCourseById);

// Protected routes (Seller / Admin)
router.get("/my-courses", protect, getSellerCourses);
router.post("/", protect, addCourse);
router.put("/:id", protect, updateCourse);
router.delete("/:id", protect, deleteCourse);

module.exports = router;
