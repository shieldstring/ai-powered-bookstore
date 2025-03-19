const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createGroup, addDiscussion, getDiscussions, editGroup, deleteGroup, sendGroupMessage, getGroupMessages } = require('../controllers/groupController');

const router = express.Router();

router.post('/', protect, createGroup);
router.post('/discussions', protect, addDiscussion);
router.get('/:groupId/discussions', protect, getDiscussions);
router.put('/:id', protect, editGroup);
router.delete('/:id', protect, deleteGroup);
router.post('/:groupId/messages', protect, sendGroupMessage); // Send a message to a group
router.get('/:groupId/messages', protect, getGroupMessages); // Get messages from a group

module.exports = router;