const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const User = require('../models/User');
const Trip = require('../models/Trip');

// Calculate Trust Score
const calculateTrustScore = (user) => {
  let score = 50; // Base score

  if (user.isVerified) {
    score += 20;
  }

  if (user.totalReviews > 0) {
    score += (user.averageRating / 5) * 30;
  } else {
    // If no reviews, give them a baseline of 15 out of 30 for the rating portion
    score += 15;
  }

  return Math.min(Math.round(score), 100);
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { revieweeId, tripId, rating, comment } = req.body;
  const reviewerId = req.user._id;

  if (reviewerId.toString() === revieweeId) {
    res.status(400);
    throw new Error('You cannot review yourself');
  }

  // Validate tripId only if provided
  if (tripId) {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }
    const members = [...trip.members.map(m => m.toString()), trip.creator.toString()];
    if (!members.includes(reviewerId.toString())) {
      res.status(403);
      throw new Error('You were not part of this trip');
    }
    if (!members.includes(revieweeId)) {
      res.status(400);
      throw new Error('The user you are reviewing was not part of this trip');
    }
  }

  // Check for duplicate review (per trip or general if no trip)
  const dupQuery = tripId
    ? { reviewer: reviewerId, reviewee: revieweeId, trip: tripId }
    : { reviewer: reviewerId, reviewee: revieweeId, trip: { $exists: false } };

  const existingReview = await Review.findOne(dupQuery);
  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this user');
  }

  // Create review
  const reviewData = {
    reviewer: reviewerId,
    reviewee: revieweeId,
    rating: Number(rating),
    comment: comment || '',
  };
  if (tripId) reviewData.trip = tripId;

  const review = await Review.create(reviewData);

  // Recalculate average rating for reviewee
  const reviewee = await User.findById(revieweeId);
  const allReviews = await Review.find({ reviewee: revieweeId });
  const totalReviews = allReviews.length;
  const averageRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / totalReviews;

  reviewee.totalReviews = totalReviews;
  reviewee.averageRating = Number(averageRating.toFixed(1));
  reviewee.trustScore = calculateTrustScore(reviewee);
  await reviewee.save();

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    data: review,
  });
});

// @desc    Get user reviews
// @route   GET /api/reviews/:userId
// @access  Public
const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewee: req.params.userId })
    .populate('reviewer', 'name profilePicture')
    .populate('trip', 'title destination')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

module.exports = {
  createReview,
  getUserReviews,
};
