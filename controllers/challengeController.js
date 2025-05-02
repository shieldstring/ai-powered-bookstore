const Challenge = require('../models/Challenge');
const User = require('../models/User');

// Create a new challenge
const createChallenge = async (req, res) => {
  const { name, description, reward, startDate, endDate } = req.body;
  try {
    const challenge = await Challenge.create({ name, description, reward, startDate, endDate });
    res.status(201).json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Join a challenge
const joinChallenge = async (req, res) => {
  const { challengeId } = req.body;
  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    // Add user to participants
    challenge.participants.push(req.user._id);
    await challenge.save();
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Complete a challenge and reward tokens
const completeChallenge = async (req, res) => {
  const { challengeId } = req.body;
  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    // Check if user is a participant
    if (!challenge.participants.includes(req.user._id)) {
      return res.status(400).json({ message: 'User not a participant' });
    }
    // Reward tokens to the user
    const user = await User.findById(req.user._id);
    user.tokens += challenge.reward;
    await user.save();
    res.json({ message: 'Challenge completed', tokens: user.tokens });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get upcoming challenges
const getChallenges = async (req, res) => {
  try {
    // Find challenges where the end date is in the future
    const currentDate = new Date();
    const upcomingChallenges = await Challenge.find({
      endDate: { $gte: currentDate }
    }).sort({ startDate: 1 }); // Sort by start date in ascending order
    
    res.json(upcomingChallenges);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createChallenge, joinChallenge, completeChallenge, getChallenges };