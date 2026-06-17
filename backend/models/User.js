const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // Traveler Profile Fields
    age: {
      type: Number,
      min: 18,
      max: 120,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say', ''],
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    country: {
      type: String,
      trim: true,
      default: '',
    },
    languages: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    travelStyle: {
      type: String,
      enum: ['Backpacker', 'Luxury', 'Adventure', 'Relaxation', 'Cultural', 'Business', ''],
      default: '',
    },
    budgetPreference: {
      type: String,
      enum: ['Budget', 'Moderate', 'Luxury', ''],
      default: '',
    },
    interests: {
      type: [String],
      default: [],
    },
    favoriteDestinations: {
      type: [String],
      default: [],
    },
    // Personality Assessment Fields
    personalityType: {
      type: String,
      default: '',
    },
    compatibilityFactors: {
      type: [String],
      default: [],
    },
    assessmentAnswers: {
      luxuryLevel: { type: String, default: '' },
      adventureLevel: { type: String, default: '' },
      foodPreferences: { type: String, default: '' },
      travelPace: { type: String, default: '' },
      socialPersonality: { type: String, default: '' },
      sleepSchedule: { type: String, default: '' },
    },
    // Social Features
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    // Safety & Verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    idDocument: {
      type: String, // Base64 image of government ID
      default: '',
    },
    idSubmittedAt: {
      type: Date,
    },
    emergencyContacts: [
      {
        name: { type: String, required: true },
        relation: { type: String, required: true },
        phone: { type: String, required: true },
      },
    ],
    blockedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    // Reviews & Reputation
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    trustScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
