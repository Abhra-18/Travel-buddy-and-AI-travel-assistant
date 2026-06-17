const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// ─────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate fields
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      data: {
        ...userObj,
        token: generateToken(user._id),
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// ─────────────────────────────────────────
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: cleanEmail });

  // Use matchPassword method from User model
  if (user && (await user.matchPassword(password))) {
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      data: {
        ...userObj,
        token: generateToken(user._id),
      },
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// ─────────────────────────────────────────
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
// ─────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  // If we were using HTTP-only cookies, we would clear them here.
  // Since we are using client-side JWTs, the client handles deleting the token.
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// ─────────────────────────────────────────
// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  res.status(200).json({
    success: true,
    data: user,
  });
});

// ─────────────────────────────────────────
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
// ─────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    // Properly handle age so empty string becomes undefined (removes cast error)
    if (req.body.age !== undefined) {
      user.age = req.body.age === '' ? undefined : Number(req.body.age);
    }
    
    user.gender = req.body.gender !== undefined ? req.body.gender : user.gender;
    user.city = req.body.city !== undefined ? req.body.city : user.city;
    user.country = req.body.country !== undefined ? req.body.country : user.country;
    user.languages = req.body.languages || user.languages;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.travelStyle = req.body.travelStyle !== undefined ? req.body.travelStyle : user.travelStyle;
    user.budgetPreference = req.body.budgetPreference !== undefined ? req.body.budgetPreference : user.budgetPreference;
    user.interests = req.body.interests || user.interests;
    user.favoriteDestinations = req.body.favoriteDestinations || user.favoriteDestinations;

    if (req.body.profilePicture) {
      user.profilePicture = req.body.profilePicture;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    
    const userObj = updatedUser.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      data: {
        ...userObj,
        token: generateToken(updatedUser._id),
      },
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// ─────────────────────────────────────────
// @desc    Submit ID Document for Verification
// @route   POST /api/auth/verify
// @access  Private
// ─────────────────────────────────────────
const submitVerification = asyncHandler(async (req, res) => {
  const { idDocument } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!idDocument) {
    res.status(400);
    throw new Error('Please provide an ID document image');
  }

  user.idDocument = idDocument;
  user.idSubmittedAt = Date.now();
  user.isVerified = false;
  
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Verification document submitted successfully',
  });
});

// ─────────────────────────────────────────
// @desc    Toggle Follow user
// @route   POST /api/auth/follow/:id
// @access  Private
// ─────────────────────────────────────────
const toggleFollow = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user._id);

  if (!targetUser) {
    res.status(404);
    throw new Error('User not found');
  }

  if (targetUser._id.toString() === currentUser._id.toString()) {
    res.status(400);
    throw new Error('You cannot follow yourself');
  }

  const isFollowing = currentUser.following.includes(targetUser._id);

  if (isFollowing) {
    currentUser.following = currentUser.following.filter(id => id.toString() !== targetUser._id.toString());
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUser._id.toString());
  } else {
    currentUser.following.push(targetUser._id);
    targetUser.followers.push(currentUser._id);
  }

  await currentUser.save();
  await targetUser.save();

  res.status(200).json({
    success: true,
    data: {
      following: currentUser.following,
      isFollowing: !isFollowing
    }
  });
});

module.exports = { register, login, logout, getMe, updateProfile, submitVerification, toggleFollow };
