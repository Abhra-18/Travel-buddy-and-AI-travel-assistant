const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// ─── Scoring weights ───────────────────────────────────────────────────────
const WEIGHTS = {
  budget: 25,
  travelStyle: 25,
  personality: 20,
  interests: 20,
  destinations: 10,
};

const scoreExact = (a, b, weight) => (a && b && a === b ? weight : 0);

const scoreKeyword = (a, b, weight) => {
  if (!a || !b) return 0;
  const aWords = a.toLowerCase().split(/\s+/);
  const bWords = b.toLowerCase().split(/\s+/);
  return aWords.some((w) => bWords.includes(w)) ? weight : 0;
};

const scoreArrayOverlap = (arrA, arrB, weight) => {
  if (!arrA?.length || !arrB?.length) return 0;
  const setA = new Set(arrA.map((s) => s.toLowerCase()));
  const shared = arrB.filter((s) => setA.has(s.toLowerCase()));
  const ratio = Math.min(shared.length / Math.max(arrA.length, arrB.length, 1), 1);
  return Math.round(weight * (0.5 + 0.5 * ratio) * (shared.length > 0 ? 1 : 0));
};

// ─── Main compatibility algorithm ──────────────────────────────────────────
const calculateCompatibility = (currentUser, otherUser) => {
  let totalScore = 0;
  const reasons = [];

  // 1. Budget
  const budgetScore = scoreExact(currentUser.budgetPreference, otherUser.budgetPreference, WEIGHTS.budget);
  totalScore += budgetScore;
  if (budgetScore > 0) reasons.push('Same budget style 💰');

  // 2. Travel Style
  const styleScore = scoreExact(currentUser.travelStyle, otherUser.travelStyle, WEIGHTS.travelStyle);
  totalScore += styleScore;
  if (styleScore > 0) reasons.push('Matching travel style ✈️');

  // 3. Personality Type (keyword overlap)
  const personalityScore = scoreKeyword(currentUser.personalityType, otherUser.personalityType, WEIGHTS.personality);
  totalScore += personalityScore;
  if (personalityScore > 0) reasons.push('Similar travel personality 🧠');

  // 4. Shared Interests
  const interestScore = scoreArrayOverlap(currentUser.interests, otherUser.interests, WEIGHTS.interests);
  totalScore += interestScore;
  if (interestScore > 0) reasons.push('Shared interests & hobbies 🎯');

  // 5. Shared Destinations
  const destScore = scoreArrayOverlap(currentUser.favoriteDestinations, otherUser.favoriteDestinations, WEIGHTS.destinations);
  totalScore += destScore;
  if (destScore > 0) reasons.push('Love the same destinations 🗺️');

  // Soft bonus: same gender
  if (currentUser.gender && otherUser.gender && currentUser.gender === otherUser.gender) {
    totalScore = Math.min(totalScore + 3, 100);
  }

  return {
    matchPercentage: Math.min(Math.round(totalScore), 100),
    matchReasons: reasons,
  };
};

// @desc    Get travel buddy matches for the current user
// @route   GET /api/matches
// @access  Private
const getMatches = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id).select('-password');

  if (!currentUser) {
    res.status(404);
    throw new Error('User not found');
  }

  // Build exclusion list: blocked users (both directions)
  const blockedByMe = currentUser.blockedUsers || [];
  
  const otherUsers = await User.find({
    _id: { $ne: currentUser._id, $nin: blockedByMe },
    blockedUsers: { $ne: currentUser._id }, // Also exclude users who blocked me
    $or: [
      { personalityType: { $ne: '' } },
      { travelStyle: { $ne: '' } },
    ],
  }).select('-password -idDocument');

  if (!otherUsers.length) {
    return res.status(200).json({ success: true, data: [] });
  }

  const { style, budget, minScore } = req.query;

  let matches = otherUsers
    .map((other) => {
      const { matchPercentage, matchReasons } = calculateCompatibility(currentUser, other);
      return {
        _id: other._id,
        name: other.name,
        profilePicture: other.profilePicture,
        isVerified: other.isVerified,
        city: other.city,
        country: other.country,
        travelStyle: other.travelStyle,
        budgetPreference: other.budgetPreference,
        personalityType: other.personalityType,
        interests: other.interests,
        favoriteDestinations: other.favoriteDestinations,
        bio: other.bio,
        languages: other.languages,
        matchPercentage,
        matchReasons,
        trustScore: other.trustScore,
        averageRating: other.averageRating,
        totalReviews: other.totalReviews,
      };
    })
    .filter((m) => m.matchPercentage > 0)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);

  // Apply filters
  if (style) {
    matches = matches.filter(m => m.travelStyle === style);
  }
  if (budget) {
    matches = matches.filter(m => m.budgetPreference === budget);
  }
  if (minScore) {
    matches = matches.filter(m => m.matchPercentage >= parseInt(minScore));
  }

  res.status(200).json({ success: true, count: matches.length, data: matches });
});

module.exports = { getMatches };
