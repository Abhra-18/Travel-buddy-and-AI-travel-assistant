const asyncHandler = require('express-async-handler');
const TripPlan = require('../models/TripPlan');
const { askGemini } = require('../utils/geminiClient');

// ─── Destination knowledge base ───────────────────────────────────────────────
const destinationData = {
  default: {
    attractions: ['Historic Old Town', 'Central Market', 'National Museum', 'Scenic Viewpoint', 'Local Art District', 'Botanical Garden', 'Waterfront Promenade', 'Street Food Market'],
    foods: ['Local street food platter', 'Traditional breakfast', 'Fresh seafood', 'Local market lunch', 'Rooftop dinner', 'Traditional desserts', 'Night market snacks'],
    bestTime: 'October to April (dry season)',
    tips: ['Always carry local currency', 'Book popular attractions in advance', 'Use local transport to save money', 'Try eating where locals eat', 'Respect local customs and dress codes'],
  },
  bali: {
    attractions: ['Tanah Lot Temple', 'Ubud Monkey Forest', 'Tegalalang Rice Terraces', 'Seminyak Beach', 'Sacred Monkey Forest Sanctuary', 'Tirta Empul Temple', 'Uluwatu Temple', 'Kuta Beach', 'Nusa Penida Island', 'Ubud Art Market'],
    foods: ['Nasi Goreng', 'Babi Guling', 'Satay Lilit', 'Lawar', 'Bebek Betutu', 'Mie Goreng', 'Fresh coconut water', 'Balinese coffee'],
    bestTime: 'April to October',
    tips: ['Dress modestly at temples', 'Rent a scooter to get around', 'Bargain at local markets', 'Avoid tap water', 'Book rice terrace visits early morning'],
  },
  paris: {
    attractions: ['Eiffel Tower', 'The Louvre', 'Notre-Dame Cathedral', 'Musée d\'Orsay', 'Sacré-Cœur', 'Champs-Élysées', 'Palace of Versailles', 'Montmartre', 'Seine River Cruise', 'Centre Pompidou'],
    foods: ['Croissant & café au lait', 'Crêpes at street stalls', 'French onion soup', 'Steak frites', 'Escargot', 'Crème brûlée', 'Macarons from Ladurée', 'Cheese & wine platter'],
    bestTime: 'April to June, September to October',
    tips: ['Buy a Paris Museum Pass', 'Book Eiffel Tower tickets online', 'Metro is the fastest transport', 'Many museums are free on first Sunday', 'Learn basic French phrases'],
  },
  tokyo: {
    attractions: ['Shinjuku Gyoen', 'Senso-ji Temple', 'Shibuya Crossing', 'Akihabara', 'Tsukiji Fish Market', 'Meiji Shrine', 'Harajuku', 'teamLab Borderless', 'Mount Fuji day trip', 'Odaiba'],
    foods: ['Ramen', 'Sushi at Tsukiji', 'Tempura', 'Takoyaki', 'Yakitori', 'Tonkatsu', 'Mochi ice cream', 'Japanese curry'],
    bestTime: 'March to May (cherry blossoms), October to November',
    tips: ['Get a Suica card for transport', 'Most places are cash only', 'Shoes that slip off easily for temples', 'Convenience store food is excellent', 'Tipping is not customary'],
  },
  dubai: {
    attractions: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Desert Safari', 'Dubai Marina', 'Gold Souk', 'Spice Souk', 'Dubai Creek', 'Miracle Garden', 'Frame Dubai'],
    foods: ['Shawarma', 'Camel milk ice cream', 'Al Harees', 'Luqaimat', 'Mezze platter', 'Fresh dates', 'Arabic coffee', 'Seafood at Dubai Marina'],
    bestTime: 'November to March',
    tips: ['Dress modestly in public areas', 'Book desert safari in advance', 'Alcohol only at licensed venues', 'Taxi is metered and reliable', 'Friday is the holy day — reduced hours'],
  },
  thailand: {
    attractions: ['Grand Palace Bangkok', 'Wat Pho', 'Chiang Mai Night Bazaar', 'Phi Phi Islands', 'Elephant Sanctuary', 'Ayutthaya Historical Park', 'Floating Markets', 'Tiger Cave Temple', 'Chatuchak Market', 'James Bond Island'],
    foods: ['Pad Thai', 'Tom Yum Soup', 'Green Curry', 'Mango Sticky Rice', 'Som Tum', 'Massaman Curry', 'Khao Man Gai', 'Thai street BBQ'],
    bestTime: 'November to March',
    tips: ['Remove shoes at temples', 'Bargain at markets', 'Avoid touching monks', 'Tuk-tuks are great for short trips', 'Carry small denominations of baht'],
  },
  london: {
    attractions: ['Tower of London', 'British Museum', 'Buckingham Palace', 'Big Ben', 'Hyde Park', 'Borough Market', 'Tate Modern', 'The Shard', 'Notting Hill', 'Greenwich'],
    foods: ['Full English Breakfast', 'Fish & Chips', 'Afternoon Tea', 'Chicken tikka masala', 'Bangers & mash', 'Cornish pasty', 'Eton mess', 'Craft beer at local pub'],
    bestTime: 'May to September',
    tips: ['Get an Oyster card for tube', 'Many museums are free', 'Queue etiquette is important', 'Book shows and attractions in advance', 'Weather is unpredictable — bring layers'],
  },
  maldives: {
    attractions: ['Snorkeling at House Reef', 'Whale Shark Watching', 'Dolphin Cruise', 'Underwater Restaurant', 'Sandbank Picnic', 'Local Island Visit', 'Bioluminescent Beach', 'Water Sports Paradise'],
    foods: ['Mas huni (tuna breakfast)', 'Garudhiya (fish soup)', 'Grilled lobster', 'Fresh coconut', 'Fihunu mas (grilled fish)', 'Rihaakuru', 'Tropical fruit platters', 'Seafood BBQ on the beach'],
    bestTime: 'November to April',
    tips: ['Book overwater bungalows early', 'Alcohol only at resort islands', 'Dress modestly on local islands', 'Bring reef-safe sunscreen', 'Seaplane transfers are expensive — book ahead'],
  },
};

// ─── Budget daily cost ranges (USD) ──────────────────────────────────────────
const budgetRanges = {
  Budget: { hotel: [20, 60], daily: [30, 80] },
  Moderate: { hotel: [80, 200], daily: [100, 200] },
  Luxury: { hotel: [250, 800], daily: [300, 700] },
};

const hotelTypes = {
  Budget: [
    { type: 'Hostel', multiplier: 0.5 },
    { type: 'Budget Guesthouse', multiplier: 0.7 },
    { type: 'Budget Hotel', multiplier: 1 },
  ],
  Moderate: [
    { type: '3-Star Hotel', multiplier: 1 },
    { type: 'Boutique Hotel', multiplier: 1.2 },
    { type: 'Serviced Apartment', multiplier: 0.9 },
  ],
  Luxury: [
    { type: '5-Star Resort', multiplier: 1.5 },
    { type: 'Luxury Boutique', multiplier: 1.2 },
    { type: 'Private Villa', multiplier: 2 },
  ],
};

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ─── Template itinerary generator ─────────────────────────────────────────────
const generatePlanTemplate = (destination, numberOfDays, budget) => {
  const key = destination.toLowerCase().split(/[,\s]/)[0];
  const data = destinationData[key] || destinationData.default;
  const costs = budgetRanges[budget];
  const hotelCostPerNight = rand(costs.hotel[0], costs.hotel[1]);

  // Shuffle attraction pool across days
  const attractionPool = [...data.attractions];
  const foodPool = [...data.foods];

  // Day titles
  const dayThemes = [
    'Arrival & City Exploration',
    'Cultural Immersion',
    'Nature & Adventure',
    'Hidden Gems & Local Life',
    'Food & Markets Tour',
    'Day Trip & Excursion',
    'Leisure & Relaxation',
    'Shopping & Nightlife',
    'Beach & Coastal Fun',
    'Historical Sites',
  ];

  const itinerary = Array.from({ length: numberOfDays }, (_, i) => {
    const dayAttractions = pick(attractionPool, rand(2, 3));
    const dayCost = rand(costs.daily[0], costs.daily[1]);

    return {
      day: i + 1,
      title: dayThemes[i % dayThemes.length],
      morning: `Start your day with breakfast at a local café, then visit ${dayAttractions[0] || 'the city center'}.`,
      afternoon: `Head to ${dayAttractions[1] || 'a local market'} for lunch and an afternoon of exploration.`,
      evening: `End the day with dinner at a ${budget === 'Luxury' ? 'fine dining restaurant' : 'local eatery'}, then enjoy ${dayAttractions[2] || 'the night scene'}.`,
      attractions: dayAttractions,
      foodRecommendations: pick(foodPool, rand(2, 3)),
      estimatedDayCost: dayCost,
    };
  });

  // Hotels
  const hotelOptions = hotelTypes[budget];
  const hotelSuggestions = hotelOptions.map((h, i) => ({
    name: `${destination.split(',')[0]} ${h.type}`,
    hotelType: h.type,
    pricePerNight: Math.round(hotelCostPerNight * h.multiplier),
    rating: budget === 'Budget' ? rand(3, 4) : budget === 'Moderate' ? rand(4, 5) : 5,
    description: `A great ${h.type.toLowerCase()} option in ${destination} offering comfort and value for ${budget.toLowerCase()} travelers.`,
  }));

  const totalItineraryCost = itinerary.reduce((sum, d) => sum + d.estimatedDayCost, 0);
  const totalHotelCost = hotelCostPerNight * numberOfDays;
  const totalEstimatedCost = totalItineraryCost + totalHotelCost;

  return {
    itinerary,
    hotelSuggestions,
    generalTips: data.tips,
    bestTimeToVisit: data.bestTime,
    totalEstimatedCost,
    aiGenerated: false,
  };
};

// ─── Gemini-powered plan generator ───────────────────────────────────────────
const generatePlanWithAI = async (destination, numberOfDays, budget, travelStyle) => {
  const prompt = `
You are an expert travel planner for TravelMate AI.

Generate a detailed ${numberOfDays}-day trip plan for: ${destination}
Budget level: ${budget}
Travel style: ${travelStyle || 'General'}

Respond ONLY with valid JSON in this exact structure:
{
  "bestTimeToVisit": "string",
  "generalTips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "hotelSuggestions": [
    { "name": "Hotel Name", "hotelType": "Hotel Type", "pricePerNight": 120, "rating": 4, "description": "brief description" },
    { "name": "Hotel Name 2", "hotelType": "Type", "pricePerNight": 80, "rating": 3, "description": "brief description" },
    { "name": "Hotel Name 3", "hotelType": "Type", "pricePerNight": 200, "rating": 5, "description": "brief description" }
  ],
  "itinerary": [
    {
      "day": 1,
      "title": "Day theme title",
      "morning": "Morning activity description",
      "afternoon": "Afternoon activity description",
      "evening": "Evening activity description",
      "attractions": ["Attraction 1", "Attraction 2"],
      "foodRecommendations": ["Food 1", "Food 2"],
      "estimatedDayCost": 80
    }
  ],
  "totalEstimatedCost": 1200
}

Generate all ${numberOfDays} days in the itinerary array. Make it realistic and specific to ${destination}.
`;

  const response = await askGemini(prompt);
  if (!response) return null;

  try {
    const cleaned = response.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.itinerary?.length && parsed.hotelSuggestions?.length) {
      return { ...parsed, aiGenerated: true };
    }
    return null;
  } catch (e) {
    console.error('Gemini plan parse error:', e.message);
    return null;
  }
};

// ─── Controllers ─────────────────────────────────────────────────────────────

// @route   POST /api/plans/generate
// @access  Private
const generatePlan = asyncHandler(async (req, res) => {
  const { destination, numberOfDays, budget, travelStyle } = req.body;

  if (!destination || !numberOfDays || !budget) {
    res.status(400);
    throw new Error('Destination, number of days, and budget are required.');
  }

  // Try Gemini first, fall back to template
  let planData = await generatePlanWithAI(destination, numberOfDays, budget, travelStyle);
  if (!planData) {
    console.log('Using template generator for trip plan.');
    planData = generatePlanTemplate(destination, numberOfDays, budget);
  }

  res.status(200).json({ success: true, data: planData });
});

// @route   POST /api/plans/save
// @access  Private
const savePlan = asyncHandler(async (req, res) => {
  const { destination, numberOfDays, budget, travelStyle, ...planData } = req.body;

  if (!destination || !numberOfDays || !budget) {
    res.status(400);
    throw new Error('Missing required fields.');
  }

  const plan = await TripPlan.create({
    user: req.user._id,
    destination,
    numberOfDays,
    budget,
    travelStyle: travelStyle || '',
    ...planData,
  });

  res.status(201).json({ success: true, data: plan });
});

// @route   GET /api/plans
// @access  Private
const getMyPlans = asyncHandler(async (req, res) => {
  const plans = await TripPlan.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: plans.length, data: plans });
});

// @route   GET /api/plans/:id
// @access  Private
const getPlanById = asyncHandler(async (req, res) => {
  const plan = await TripPlan.findOne({ _id: req.params.id, user: req.user._id });
  if (!plan) { res.status(404); throw new Error('Plan not found.'); }
  res.status(200).json({ success: true, data: plan });
});

// @route   DELETE /api/plans/:id
// @access  Private
const deletePlan = asyncHandler(async (req, res) => {
  const plan = await TripPlan.findOne({ _id: req.params.id, user: req.user._id });
  if (!plan) { res.status(404); throw new Error('Plan not found.'); }
  await plan.deleteOne();
  res.status(200).json({ success: true, message: 'Plan deleted.' });
});

module.exports = { generatePlan, savePlan, getMyPlans, getPlanById, deletePlan };
