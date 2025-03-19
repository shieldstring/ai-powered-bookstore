const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createGroup, addDiscussion, getDiscussions, editGroup, deleteGroup } = require('../controllers/groupController');

const router = express.Router();

router.post('/', protect, createGroup);
router.post('/discussions', protect, addDiscussion);
router.get('/:groupId/discussions', protect, getDiscussions);
router.put('/:id', protect, editGroup); // Edit a group
router.delete('/:id', protect, deleteGroup); // Delete a group

module.exports = router;