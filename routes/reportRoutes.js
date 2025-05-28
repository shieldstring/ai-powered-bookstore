const express = require('express');
const { createReport, getReports, updateReportStatus, hidePost, deleteComment, resolveReport } = require('../controllers/reportController');
const { protect, admin } = require("../middleware/authMiddleware");
const router = express.Router();

// POST /api/reports
router.post('/', protect, createReport);

// GET /api/reports - Admin/Moderator access only
router.get('/', protect, admin, getReports);

// PUT /api/reports/:id/status - Admin/Moderator access only
router.put('/:id/status', protect, admin, updateReportStatus);

// PUT /api/reports/posts/:postId/hide - Admin/Moderator access only
router.put('/posts/:postId/hide', protect, admin, hidePost);

// DELETE /api/reports/posts/:postId/comments/:commentId - Admin/Moderator access only
router.delete('/posts/:postId/comments/:commentId',protect, admin, deleteComment);

// PUT /api/reports/:id/resolve - Admin/Moderator access only
router.put('/:id/resolve', protect, admin, resolveReport);

module.exports = router;