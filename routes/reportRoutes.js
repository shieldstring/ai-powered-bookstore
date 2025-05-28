const express = require('express');
const { createReport, getReports, updateReportStatus, hidePost, deleteComment } = require('../controllers/reportController');

const router = express.Router();

// POST /api/reports
router.post('/', createReport);

// GET /api/reports - Admin/Moderator access only
router.get('/', getReports);

// PUT /api/reports/:id/status - Admin/Moderator access only
router.put('/:id/status', updateReportStatus);

// PUT /api/reports/posts/:postId/hide - Admin/Moderator access only
router.put('/posts/:postId/hide', hidePost);

// DELETE /api/reports/posts/:postId/comments/:commentId - Admin/Moderator access only
router.delete('/posts/:postId/comments/:commentId', deleteComment);

module.exports = router;