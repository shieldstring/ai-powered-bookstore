const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const groupRoutes = require('./routes/groupRoutes');
const mlmRoutes = require('./routes/mlmRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const postRoutes = require('./routes/postRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { protect } = require('./middleware/authMiddleware');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', protect, bookRoutes);
app.use('/api/groups', protect, groupRoutes);
app.use('/api/mlm', protect, mlmRoutes);
app.use('/api/payment', protect, paymentRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/challenges', protect, challengeRoutes);
app.use('/api/posts', protect, postRoutes); // News feed posts
app.use('/api/messages', protect, messageRoutes); // Private messaging

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));