/**
 * Seed script — adds sample travelers to the database.
 * Run with: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/travelmate_ai';

const sampleUsers = [
  {
    name: 'Aanya Sharma',
    email: 'aanya@demo.com',
    password: 'password123',
    city: 'Mumbai',
    country: 'India',
    age: 26,
    gender: 'Female',
    bio: 'A passionate solo traveler who loves discovering hidden gems across Asia. Always chasing sunsets and street food!',
    travelStyle: 'Backpacker',
    budgetPreference: 'Budget',
    languages: ['English', 'Hindi', 'Marathi'],
    interests: ['Photography', 'Street Food', 'Hiking', 'Culture'],
    favoriteDestinations: ['Bali', 'Thailand', 'Nepal', 'Sri Lanka'],
    personalityType: 'The Fearless Nomad',
    compatibilityFactors: ['Thrifty', 'Thrill Seeker', 'Foodie Adventurer', 'Extrovert'],
    assessmentAnswers: {
      luxuryLevel: 'Budget',
      adventureLevel: 'High',
      foodPreferences: 'Street Food',
      travelPace: 'Fast',
      socialPersonality: 'Extrovert',
      sleepSchedule: 'Early Bird',
    },
  },
  {
    name: 'Marcus Jensen',
    email: 'marcus@demo.com',
    password: 'password123',
    city: 'Copenhagen',
    country: 'Denmark',
    age: 31,
    gender: 'Male',
    bio: 'Digital nomad working remotely while exploring Europe and Southeast Asia. Love coffee shops, co-working spaces and weekend adventures.',
    travelStyle: 'Backpacker',
    budgetPreference: 'Moderate',
    languages: ['English', 'Danish', 'German'],
    interests: ['Photography', 'Coffee', 'Hiking', 'Tech', 'Music'],
    favoriteDestinations: ['Portugal', 'Vietnam', 'Japan', 'Thailand'],
    personalityType: 'The Energetic Jetsetter',
    compatibilityFactors: ['Balanced Budget', 'Thrill Seeker', 'Action Packed', 'Ambivert'],
    assessmentAnswers: {
      luxuryLevel: 'Moderate',
      adventureLevel: 'High',
      foodPreferences: 'Casual',
      travelPace: 'Fast',
      socialPersonality: 'Ambivert',
      sleepSchedule: 'Flexible',
    },
  },
  {
    name: 'Priya Nair',
    email: 'priya@demo.com',
    password: 'password123',
    city: 'Bangalore',
    country: 'India',
    age: 28,
    gender: 'Female',
    bio: 'Yoga teacher and wellness traveler. I prefer slow travel — really soaking in a place rather than rushing through a checklist.',
    travelStyle: 'Relaxation',
    budgetPreference: 'Moderate',
    languages: ['English', 'Hindi', 'Malayalam'],
    interests: ['Yoga', 'Wellness', 'Meditation', 'Nature', 'Cooking'],
    favoriteDestinations: ['Bali', 'Sri Lanka', 'Greece', 'Nepal'],
    personalityType: 'The Mindful Wanderer',
    compatibilityFactors: ['Balanced Budget', 'Relaxed', 'Slow Traveler', 'Introvert', 'Early Riser'],
    assessmentAnswers: {
      luxuryLevel: 'Moderate',
      adventureLevel: 'Low',
      foodPreferences: 'Casual',
      travelPace: 'Slow',
      socialPersonality: 'Introvert',
      sleepSchedule: 'Early Bird',
    },
  },
  {
    name: 'Lucas Fontaine',
    email: 'lucas@demo.com',
    password: 'password123',
    city: 'Paris',
    country: 'France',
    age: 34,
    gender: 'Male',
    bio: 'Fine dining enthusiast and luxury hotel reviewer. I believe travel should be indulgent and never rushed. Champagne over hostels any day!',
    travelStyle: 'Luxury',
    budgetPreference: 'Luxury',
    languages: ['French', 'English', 'Italian'],
    interests: ['Fine Dining', 'Wine', 'Art', 'Architecture', 'Fashion'],
    favoriteDestinations: ['Maldives', 'Italy', 'Monaco', 'Dubai'],
    personalityType: 'The Luxury Adventurer',
    compatibilityFactors: ['High Budget', 'Gourmet Lover', 'Relaxed', 'Extrovert'],
    assessmentAnswers: {
      luxuryLevel: 'Luxury',
      adventureLevel: 'Low',
      foodPreferences: 'Fine Dining',
      travelPace: 'Slow',
      socialPersonality: 'Extrovert',
      sleepSchedule: 'Night Owl',
    },
  },
  {
    name: 'Sofia Reyes',
    email: 'sofia@demo.com',
    password: 'password123',
    city: 'Mexico City',
    country: 'Mexico',
    age: 25,
    gender: 'Female',
    bio: 'Adventure sports addict and backpacker. Skydiving, scuba diving, volcano trekking — I want to do it all! Always looking for a partner in crime.',
    travelStyle: 'Adventure',
    budgetPreference: 'Budget',
    languages: ['Spanish', 'English', 'Portuguese'],
    interests: ['Scuba Diving', 'Skydiving', 'Hiking', 'Photography', 'Street Food'],
    favoriteDestinations: ['Nepal', 'New Zealand', 'Costa Rica', 'Thailand', 'Peru'],
    personalityType: 'The Fearless Nomad',
    compatibilityFactors: ['Thrifty', 'Thrill Seeker', 'Foodie Adventurer', 'Extrovert', 'Night Owl'],
    assessmentAnswers: {
      luxuryLevel: 'Budget',
      adventureLevel: 'High',
      foodPreferences: 'Street Food',
      travelPace: 'Fast',
      socialPersonality: 'Extrovert',
      sleepSchedule: 'Night Owl',
    },
  },
  {
    name: 'Hiroshi Tanaka',
    email: 'hiroshi@demo.com',
    password: 'password123',
    city: 'Tokyo',
    country: 'Japan',
    age: 29,
    gender: 'Male',
    bio: 'Culture enthusiast who loves deep-diving into local traditions, museums, and local cuisine. Travel is about understanding people, not ticking boxes.',
    travelStyle: 'Cultural',
    budgetPreference: 'Moderate',
    languages: ['Japanese', 'English'],
    interests: ['History', 'Museums', 'Local Cuisine', 'Temples', 'Photography'],
    favoriteDestinations: ['India', 'Morocco', 'Peru', 'Greece', 'Vietnam'],
    personalityType: 'The Balanced Explorer',
    compatibilityFactors: ['Balanced Budget', 'Relaxed', 'Slow Traveler', 'Introvert', 'Early Riser'],
    assessmentAnswers: {
      luxuryLevel: 'Moderate',
      adventureLevel: 'Moderate',
      foodPreferences: 'Casual',
      travelPace: 'Slow',
      socialPersonality: 'Introvert',
      sleepSchedule: 'Early Bird',
    },
  },
  {
    name: 'Zoe Williams',
    email: 'zoe@demo.com',
    password: 'password123',
    city: 'Sydney',
    country: 'Australia',
    age: 27,
    gender: 'Female',
    bio: 'Beach lover, surfer, and hostel social butterfly. I\'ve stayed in 60+ hostels across 30 countries and I love every single one.',
    travelStyle: 'Backpacker',
    budgetPreference: 'Budget',
    languages: ['English'],
    interests: ['Surfing', 'Beach', 'Hostels', 'Nightlife', 'Street Food', 'Hiking'],
    favoriteDestinations: ['Bali', 'Thailand', 'Portugal', 'Hawaii', 'Costa Rica'],
    personalityType: 'The Fearless Nomad',
    compatibilityFactors: ['Thrifty', 'Thrill Seeker', 'Foodie Adventurer', 'Extrovert', 'Night Owl'],
    assessmentAnswers: {
      luxuryLevel: 'Budget',
      adventureLevel: 'High',
      foodPreferences: 'Street Food',
      travelPace: 'Moderate',
      socialPersonality: 'Extrovert',
      sleepSchedule: 'Night Owl',
    },
  },
  {
    name: 'Rahul Verma',
    email: 'rahul@demo.com',
    password: 'password123',
    city: 'Delhi',
    country: 'India',
    age: 30,
    gender: 'Male',
    bio: 'Travel blogger and photographer. I look for authentic local experiences on a shoestring budget. Currently planning a 6-month trip across South America.',
    travelStyle: 'Backpacker',
    budgetPreference: 'Budget',
    languages: ['Hindi', 'English'],
    interests: ['Photography', 'Blogging', 'Street Food', 'Culture', 'Hiking'],
    favoriteDestinations: ['Peru', 'Colombia', 'Thailand', 'Nepal', 'Morocco'],
    personalityType: 'The Budget Backpacker',
    compatibilityFactors: ['Thrifty', 'Foodie Adventurer', 'Action Packed', 'Ambivert'],
    assessmentAnswers: {
      luxuryLevel: 'Budget',
      adventureLevel: 'Moderate',
      foodPreferences: 'Street Food',
      travelPace: 'Fast',
      socialPersonality: 'Ambivert',
      sleepSchedule: 'Flexible',
    },
  },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    for (const userData of sampleUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (exists) {
        console.log(`⏭  Skipped (already exists): ${userData.email}`);
        skipped++;
        continue;
      }

      // Hash password manually (pre-save hook is async, use it here)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      await User.create({ ...userData, password: hashedPassword });
      console.log(`✅ Created: ${userData.name} (${userData.email})`);
      created++;
    }

    console.log(`\n🎉 Seeding complete! ${created} users created, ${skipped} skipped.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
