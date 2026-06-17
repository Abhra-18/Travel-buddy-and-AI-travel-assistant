const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// ─── Rule-based personality algorithm ────────────────────────────────────────
const calculatePersonality = (answers) => {
  let score = 0;
  let traits = [];

  // 1. Luxury vs Budget
  if (answers.luxuryLevel === 'Luxury') { score += 10; traits.push('High Budget'); }
  else if (answers.luxuryLevel === 'Budget') { score -= 10; traits.push('Thrifty'); }
  else { traits.push('Balanced Budget'); }

  // 2. Adventure Level
  if (answers.adventureLevel === 'High') { score += 10; traits.push('Thrill Seeker'); }
  else if (answers.adventureLevel === 'Low') { score -= 10; traits.push('Relaxed'); }

  // 3. Food Preferences
  if (answers.foodPreferences === 'Street Food') { score -= 5; traits.push('Foodie Adventurer'); }
  else if (answers.foodPreferences === 'Fine Dining') { score += 5; traits.push('Gourmet Lover'); }

  // 4. Travel Pace
  if (answers.travelPace === 'Fast') { score += 5; traits.push('Action Packed'); }
  else if (answers.travelPace === 'Slow') { score -= 5; traits.push('Slow Traveler'); }

  // 5. Social Personality
  if (answers.socialPersonality === 'Extrovert') traits.push('Extrovert');
  else if (answers.socialPersonality === 'Introvert') traits.push('Introvert');
  else traits.push('Ambivert');

  // 6. Sleep Schedule
  if (answers.sleepSchedule === 'Early Bird') traits.push('Early Riser');
  else if (answers.sleepSchedule === 'Night Owl') traits.push('Night Owl');
  else traits.push('Flexible Sleeper');

  // Determine Archetype based on score + combo rules
  let personalityType = 'The Balanced Explorer';
  if (score >= 20) personalityType = 'The Luxury Adventurer';
  else if (score <= -20) personalityType = 'The Budget Backpacker';
  else if (score > 0 && answers.travelPace === 'Fast') personalityType = 'The Energetic Jetsetter';
  else if (score < 0 && answers.travelPace === 'Slow') personalityType = 'The Mindful Wanderer';
  if (answers.foodPreferences === 'Street Food' && answers.adventureLevel === 'High') {
    personalityType = 'The Fearless Nomad';
  }
  if (answers.travelStyle === 'Luxury' && answers.foodPreferences === 'Fine Dining') {
    personalityType = 'The Luxury Connoisseur';
  }

  return { personalityType, compatibilityFactors: traits };
};

// @desc    Submit Personality Assessment
// @route   POST /api/assessment
// @access  Private
const submitAssessment = asyncHandler(async (req, res) => {
  const { luxuryLevel, adventureLevel, foodPreferences, travelPace, socialPersonality, sleepSchedule } = req.body;

  if (!luxuryLevel || !adventureLevel || !foodPreferences || !travelPace || !socialPersonality || !sleepSchedule) {
    res.status(400);
    throw new Error('Please answer all assessment questions.');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const answers = { luxuryLevel, adventureLevel, foodPreferences, travelPace, socialPersonality, sleepSchedule };
  const { personalityType, compatibilityFactors } = calculatePersonality(answers);

  user.assessmentAnswers = answers;
  user.personalityType = personalityType;
  user.compatibilityFactors = compatibilityFactors;
  await user.save();

  res.status(200).json({
    success: true,
    data: { personalityType, compatibilityFactors, assessmentAnswers: answers },
  });
});

module.exports = { submitAssessment };
