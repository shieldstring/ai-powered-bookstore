const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
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
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins (update in production)
  },
});

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', protect, bookRoutes);
app.use('/api/groups', protect, groupRoutes);
app.use('/api/mlm', protect, mlmRoutes);
app.use('/api/payment', protect, paymentRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/challenges', protect, challengeRoutes);
app.use('/api/posts', protect, postRoutes);
app.use('/api/messages', protect, messageRoutes);

// Socket.IO for real-time communication
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a group chat room
  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  // Send a message to a group
  socket.on('sendGroupMessage', ({ groupId, message }) => {
    io.to(groupId).emit('receiveGroupMessage', { userId: socket.id, message });
  });

  // Typing indicator in a group
  socket.on('typingInGroup', (groupId) => {
    socket.to(groupId).emit('userTyping', { userId: socket.id });
  });

  // Presence tracking
  socket.on('userOnline', (userId) => {
    io.emit('userStatus', { userId, status: 'online' });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    io.emit('userStatus', { userId: socket.id, status: 'offline' });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));