const express = require('express');
const { search } = require('../controllers/searchController');

const router = express.Router();

router.get('/search', search); // Global search

module.exports = router;