const mongoose = require('mongoose');

const DayPlanSchema = new mongoose.Schema({
  day: Number,
  title: String,
  morning: String,
  afternoon: String,
  evening: String,
  attractions: [String],
  foodRecommendations: [String],
  estimatedDayCost: Number,
});

const TripPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    destination: { type: String, required: true, trim: true },
    numberOfDays: { type: Number, required: true, min: 1, max: 30 },
    budget: {
      type: String,
      enum: ['Budget', 'Moderate', 'Luxury'],
      required: true,
    },
    travelStyle: { type: String, default: '' },
    totalEstimatedCost: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    hotelSuggestions: [
      {
        name: String,
        hotelType: String, // changed from 'type' to avoid mongoose schema collision
        pricePerNight: Number,
        rating: Number,
        description: String,
      },
    ],
    itinerary: [DayPlanSchema],
    generalTips: [String],
    bestTimeToVisit: String,
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TripPlan', TripPlanSchema);
