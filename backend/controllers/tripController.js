const asyncHandler = require('express-async-handler');
const Trip = require('../models/Trip');

// ─── GET all public trips ──────────────────────────────────────
// @route   GET /api/trips
// @access  Private
const getTrips = asyncHandler(async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page)  || 1);
  const limit  = Math.min(50, parseInt(req.query.limit) || 12);
  const skip   = (page - 1) * limit;
  const search = req.query.search?.trim() || '';
  const status = req.query.status || '';
  const style  = req.query.style  || '';
  const budget = req.query.budget || '';

  const filter = { isPublic: true };
  if (search) filter.$or = [
    { title:       { $regex: search, $options: 'i' } },
    { destination: { $regex: search, $options: 'i' } },
  ];
  if (status) filter.status = status;
  if (style)  filter.travelStyle = style;
  if (budget) filter.budget = budget;

  const total = await Trip.countDocuments(filter);
  const trips = await Trip.find(filter)
    .populate('creator', 'name profilePicture city country')
    .populate('members', 'name profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: trips.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: trips,
  });
});

// ─── GET single trip ───────────────────────────────────────────
// @route   GET /api/trips/:id
// @access  Private
const getTripById = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id)
    .populate('creator', 'name profilePicture city country')
    .populate('members', 'name profilePicture city country');

  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }

  res.status(200).json({ success: true, data: trip });
});

// ─── GET my trips ──────────────────────────────────────────────
// @route   GET /api/trips/my
// @access  Private
const getMyTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find({
    $or: [{ creator: req.user._id }, { members: req.user._id }],
  })
    .populate('creator', 'name profilePicture')
    .populate('members', 'name profilePicture')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: trips.length, data: trips });
});

// ─── CREATE trip ───────────────────────────────────────────────
// @route   POST /api/trips
// @access  Private
const createTrip = asyncHandler(async (req, res) => {
  const {
    title, destination, description,
    startDate, endDate, budget, budgetAmount,
    maxMembers, travelStyle, isPublic,
  } = req.body;

  if (!title || !destination || !startDate || !endDate) {
    res.status(400);
    throw new Error('Title, destination, start date and end date are required.');
  }

  if (new Date(endDate) < new Date(startDate)) {
    res.status(400);
    throw new Error('End date cannot be before start date.');
  }

  const trip = await Trip.create({
    title,
    destination,
    description,
    startDate,
    endDate,
    budget,
    budgetAmount: budgetAmount || 0,
    maxMembers: maxMembers || 4,
    travelStyle,
    isPublic: isPublic !== false,
    creator: req.user._id,
    members: [req.user._id], // creator auto-joins
  });

  const populated = await Trip.findById(trip._id)
    .populate('creator', 'name profilePicture')
    .populate('members', 'name profilePicture');

  res.status(201).json({ success: true, data: populated });
});

// ─── UPDATE trip ───────────────────────────────────────────────
// @route   PUT /api/trips/:id
// @access  Private (creator only)
const updateTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }

  if (trip.creator.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the trip creator can edit this trip.');
  }

  const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('creator', 'name profilePicture')
    .populate('members', 'name profilePicture');

  res.status(200).json({ success: true, data: updatedTrip });
});

// ─── DELETE trip ───────────────────────────────────────────────
// @route   DELETE /api/trips/:id
// @access  Private (creator only)
const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }

  if (trip.creator.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the trip creator can delete this trip.');
  }

  await trip.deleteOne();

  res.status(200).json({ success: true, message: 'Trip deleted successfully.' });
});

// ─── JOIN trip ─────────────────────────────────────────────────
// @route   POST /api/trips/:id/join
// @access  Private
const joinTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }

  const userId = req.user._id.toString();

  if (trip.members.map((m) => m.toString()).includes(userId)) {
    res.status(400);
    throw new Error('You are already a member of this trip.');
  }

  if (trip.members.length >= trip.maxMembers) {
    res.status(400);
    throw new Error('This trip is full. No more spots available.');
  }

  trip.members.push(req.user._id);
  await trip.save();

  const updated = await Trip.findById(trip._id)
    .populate('creator', 'name profilePicture')
    .populate('members', 'name profilePicture');

  res.status(200).json({ success: true, data: updated });
});

// ─── LEAVE trip ────────────────────────────────────────────────
// @route   POST /api/trips/:id/leave
// @access  Private
const leaveTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }

  const userId = req.user._id.toString();

  if (trip.creator.toString() === userId) {
    res.status(400);
    throw new Error('The creator cannot leave their own trip. Delete it instead.');
  }

  if (!trip.members.map((m) => m.toString()).includes(userId)) {
    res.status(400);
    throw new Error('You are not a member of this trip.');
  }

  trip.members = trip.members.filter((m) => m.toString() !== userId);
  await trip.save();

  res.status(200).json({ success: true, message: 'You have left the trip.' });
});

// ─── GET shared trips ──────────────────────────────────────────────
// @route   GET /api/trips/shared/:userId
// @access  Private
const getSharedTrips = asyncHandler(async (req, res) => {
  const targetUserId = req.params.userId;
  const myId = req.user._id;

  if (targetUserId === myId.toString()) {
    return res.status(200).json({ success: true, data: [] });
  }

  const trips = await Trip.find({
    $and: [
      { members: myId },
      { members: targetUserId }
    ]
  }).select('_id title destination startDate endDate');

  res.status(200).json({ success: true, count: trips.length, data: trips });
});

module.exports = { getTrips, getTripById, getMyTrips, getSharedTrips, createTrip, updateTrip, deleteTrip, joinTrip, leaveTrip };
