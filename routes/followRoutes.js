const express = require('express');
const { followUser, unfollowUser } = require('../controllers/followController');

const router = express.Router();

router.post('/:id/follow', followUser);
router.post('/:id/unfollow', unfollowUser);

module.exports = router;