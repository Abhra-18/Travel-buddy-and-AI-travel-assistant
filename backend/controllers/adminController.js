const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Report = require('../models/Report');

// @desc    Get users with pending ID verification
// @route   GET /api/admin/verifications
// @access  Admin
const getPendingVerifications = asyncHandler(async (req, res) => {
  const users = await User.find({
    idDocument: { $ne: '' },
    isVerified: false,
  }).select('name email profilePicture idDocument idSubmittedAt');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Approve user verification
// @route   PUT /api/admin/verify/:id/approve
// @access  Admin
const approveVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isVerified = true;
  user.idDocument = ''; // Remove ID for security after approval
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.name} has been verified`,
  });
});

// @desc    Reject user verification
// @route   PUT /api/admin/verify/:id/reject
// @access  Admin
const rejectVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.idDocument = '';
  user.idSubmittedAt = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: `Verification for ${user.name} has been rejected`,
  });
});

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Admin
const getReports = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const reports = await Report.find(filter)
    .populate('reporter', 'name email profilePicture')
    .populate('reportedUser', 'name email profilePicture')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reports.length,
    data: reports,
  });
});

// @desc    Resolve a report (dismiss or ban)
// @route   POST /api/admin/reports/:id/resolve
// @access  Admin
const resolveReport = asyncHandler(async (req, res) => {
  const { action } = req.body;
  const report = await Report.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  if (action === 'dismiss') {
    report.status = 'Resolved';
    await report.save();
    
    res.status(200).json({
      success: true,
      message: 'Report dismissed successfully',
    });
  } else if (action === 'ban_user') {
    report.status = 'Resolved';
    await report.save();

    // Find the reported user and delete or mark as banned
    // Let's delete the user for simplicity of a ban
    const reportedUser = await User.findById(report.reportedUser);
    if (reportedUser) {
      // In a real app, you might flag isBanned instead of deleting
      await User.findByIdAndDelete(reportedUser._id);
      
      // Delete all their posts
      const Post = require('../models/Post');
      await Post.deleteMany({ author: reportedUser._id });
    }

    res.status(200).json({
      success: true,
      message: 'User banned and report resolved',
    });
  } else {
    res.status(400);
    throw new Error('Invalid action');
  }
});

module.exports = {
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  getReports,
  resolveReport,
};
