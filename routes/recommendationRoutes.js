const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/recommendations', async (req, res) => {
  const { userId } = req.query;

  try {
    const response = await axios.get('http://localhost:5000/recommend', {
      params: { user_id: userId, top_n: 5 },
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

module.exports = router;