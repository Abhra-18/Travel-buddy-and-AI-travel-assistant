const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Trip title is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    budget: {
      type: String,
      enum: ['Budget', 'Moderate', 'Luxury', ''],
      default: '',
    },
    budgetAmount: {
      type: Number,
      default: 0,
    },
    maxMembers: {
      type: Number,
      default: 4,
      min: 1,
      max: 20,
    },
    travelStyle: {
      type: String,
      enum: ['Backpacker', 'Luxury', 'Adventure', 'Relaxation', 'Cultural', 'Business', ''],
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['Planning', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Planning',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Virtual: spots left
TripSchema.virtual('spotsLeft').get(function () {
  return this.maxMembers - this.members.length;
});

TripSchema.set('toJSON', { virtuals: true });
TripSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Trip', TripSchema);
