const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { protect, admin } = require("./middleware/authMiddleware");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");

// Load environment variables
dotenv.config();

// Connect to MongoDB database and populate with sample data in development
const populateData = process.env.NODE_ENV === "development";
connectDB(populateData);

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Enable CORS for all origins for your Express API (update in production as needed)
app.use(cors());


// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL || "https://yourdomain.com"
        : "http://localhost:3000",
    credentials: true,
  },
});

// Middleware to parse JSON
app.use(express.json());
app.use(cookieParser());

// Session middleware (required for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key-here",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Import Passport configuration
require("./config/passport");

// Routes
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const groupRoutes = require("./routes/groupRoutes");
const mlmRoutes = require("./routes/mlmRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const messageRoutes = require("./routes/messageRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const levelRoutes = require("./routes/levelRoutes");
const badgeRoutes = require("./routes/badgeRoutes");
const readingListRoutes = require("./routes/readingListRoutes");
const cartRoutes = require("./routes/cartRoutes");
const searchRoutes = require("./routes/searchRoutes");
const orderRoutes = require("./routes/orderRoutes"); // Order routes
const userRoutes = require("./routes/userRoutes"); // User routes
const notificationRoutes = require("./routes/notificationRoutes");

// Use Routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/books", bookRoutes); // Book-related routes
app.use("/api/groups", groupRoutes); // Group-related routes
app.use("/api/mlm", protect, mlmRoutes); // MLM-related routes
app.use("/api/payment", protect, paymentRoutes); // Payment-related routes
app.use("/api/leaderboard", leaderboardRoutes); // Leaderboard routes
app.use("/api/challenges", challengeRoutes); // Challenge routes
app.use("/api/messages", protect, messageRoutes); // Private messaging routes
app.use("/api/recommendations", recommendationRoutes); // Recommendation routes
app.use("/api/analytics", protect, admin, analyticsRoutes); // Analytics routes (admin only)
app.use("/api/level", protect, levelRoutes); // Leveling and XP routes
app.use("/api/badges", protect, badgeRoutes); // Badges and achievements routes
app.use("/api/reading-lists", protect, readingListRoutes); // Reading lists routes
app.use("/api/cart", protect, cartRoutes); // Cart routes
app.use("/api/search", searchRoutes); // Global search routes
app.use("/api/orders", protect, orderRoutes); // Order routes
app.use("/api/users", protect, userRoutes); // User routes
app.use("/api/notifications", notificationRoutes);

// Socket.IO for real-time communication
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join a group chat room
  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  // Send a message to a group
  socket.on("sendGroupMessage", ({ groupId, message }) => {
    io.to(groupId).emit("receiveGroupMessage", { userId: socket.id, message });
  });

  // Typing indicator in a group
  socket.on("typingInGroup", (groupId) => {
    socket.to(groupId).emit("userTyping", { userId: socket.id });
  });

  // Presence tracking
  socket.on("userOnline", (userId) => {
    io.emit("userStatus", { userId, status: "online" });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    io.emit("userStatus", { userId: socket.id, status: "offline" });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
