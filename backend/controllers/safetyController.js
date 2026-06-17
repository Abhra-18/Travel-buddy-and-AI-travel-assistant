const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Report = require('../models/Report');

// @desc    Upload Government ID for verification
// @route   POST /api/safety/upload-id
// @access  Private
const uploadID = asyncHandler(async (req, res) => {
  const { idDocument } = req.body;

  if (!idDocument) {
    res.status(400);
    throw new Error('Please provide an ID document image');
  }

  const user = await User.findById(req.user._id);

  if (user.isVerified) {
    res.status(400);
    throw new Error('You are already verified');
  }

  user.idDocument = idDocument;
  user.idSubmittedAt = new Date();
  await user.save();

  res.status(200).json({
    success: true,
    message: 'ID document submitted for review. You will be notified once verified.',
  });
});

// @desc    Update emergency contacts
// @route   PUT /api/safety/emergency-contacts
// @access  Private
const updateEmergencyContacts = asyncHandler(async (req, res) => {
  const { emergencyContacts } = req.body;

  if (!emergencyContacts || !Array.isArray(emergencyContacts)) {
    res.status(400);
    throw new Error('Please provide an array of emergency contacts');
  }

  // Validate each contact
  for (const contact of emergencyContacts) {
    if (!contact.name || !contact.relation || !contact.phone) {
      res.status(400);
      throw new Error('Each contact must have name, relation, and phone');
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { emergencyContacts },
    { new: true, runValidators: true }
  ).select('-password -idDocument');

  res.status(200).json({
    success: true,
    data: user.emergencyContacts,
  });
});

// @desc    Block a user
// @route   POST /api/safety/block/:id
// @access  Private
const blockUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;

  if (targetId === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot block yourself');
  }

  const targetUser = await User.findById(targetId);
  if (!targetUser) {
    res.status(404);
    throw new Error('User not found');
  }

  const user = await User.findById(req.user._id);
  const alreadyBlocked = user.blockedUsers.includes(targetId);

  if (alreadyBlocked) {
    // Unblock
    user.blockedUsers = user.blockedUsers.filter(
      (id) => id.toString() !== targetId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User unblocked',
      blocked: false,
      blockedUsers: user.blockedUsers,
    });
  } else {
    // Block & also unfollow each other
    user.blockedUsers.push(targetId);
    user.following = user.following.filter(
      (id) => id.toString() !== targetId
    );
    user.followers = user.followers.filter(
      (id) => id.toString() !== targetId
    );
    await user.save();

    // Remove current user from the target's followers/following
    targetUser.following = targetUser.following.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: 'User blocked',
      blocked: true,
      blockedUsers: user.blockedUsers,
    });
  }
});

// @desc    Report a user
// @route   POST /api/safety/report/:id
// @access  Private
const reportUser = asyncHandler(async (req, res) => {
  const reportedUserId = req.params.id;
  const { reason, description } = req.body;

  if (reportedUserId === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot report yourself');
  }

  if (!reason) {
    res.status(400);
    throw new Error('Please provide a reason for the report');
  }

  const reportedUser = await User.findById(reportedUserId);
  if (!reportedUser) {
    res.status(404);
    throw new Error('User not found');
  }

  const report = await Report.create({
    reporter: req.user._id,
    reportedUser: reportedUserId,
    reason,
    description: description || '',
  });

  res.status(201).json({
    success: true,
    message: 'Report submitted successfully. Our team will review it.',
    data: report,
  });
});

module.exports = {
  uploadID,
  updateEmergencyContacts,
  blockUser,
  reportUser,
};
