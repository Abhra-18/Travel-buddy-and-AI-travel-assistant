const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // For Group Trip chats
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      // Optional — reviews can be submitted without a specific trip
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 500,
      default: '',
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews: one per trip pairing, or one general review if no trip
ReviewSchema.index({ reviewer: 1, reviewee: 1, trip: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Review', ReviewSchema);
