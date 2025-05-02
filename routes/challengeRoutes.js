const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createChallenge,
  joinChallenge,
  completeChallenge,
  getChallenges,
} = require("../controllers/challengeController");

const router = express.Router();

// Get all upcoming challenges
router.get("/", getChallenges);

// Create a new challenge
router.post("/", protect, createChallenge);

// Join a challenge
router.post("/join", protect, joinChallenge);

// Complete a challenge
router.post("/complete", protect, completeChallenge);

module.exports = router;
