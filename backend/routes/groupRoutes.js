const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createGroup, addDiscussion, getDiscussions, editGroup, deleteGroup, sendGroupMessage, getGroupMessages, deleteDiscussion } = require('../controllers/groupController');

const router = express.Router();

router.post('/', protect, createGroup);
router.put('/:id', protect, editGroup); // Edit a group
router.delete('/:id', protect, deleteGroup); // Delete a group
router.post('/discussions', protect, addDiscussion);
router.get('/:groupId/discussions', protect, getDiscussions);
router.delete('/discussions/:id', protect, deleteDiscussion); // Delete a discussion
router.post('/:groupId/messages', protect, sendGroupMessage); // Send a message to a group
router.get('/:groupId/messages', protect, getGroupMessages); // Get messages from a group

module.exports = router;