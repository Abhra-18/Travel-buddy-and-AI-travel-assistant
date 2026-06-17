const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');

// @route   GET /api/messages/:userId
// @desc    Get 1:1 chat history with a specific user
// @access  Private
const getDirectMessages = asyncHandler(async (req, res) => {
  const otherUserId = req.params.userId;
  const currentUserId = req.user._id;

  const messages = await Message.find({
    $or: [
      { sender: currentUserId, receiver: otherUserId },
      { sender: otherUserId, receiver: currentUserId },
    ],
  })
    .populate('sender', 'name profilePicture')
    .sort({ createdAt: 1 });

  res.json({ success: true, data: messages });
});

// @route   GET /api/messages/trip/:tripId
// @desc    Get chat history for a group trip
// @access  Private
const getTripMessages = asyncHandler(async (req, res) => {
  const tripId = req.params.tripId;

  const messages = await Message.find({ trip: tripId })
    .populate('sender', 'name profilePicture')
    .sort({ createdAt: 1 });

  res.json({ success: true, data: messages });
});

// @route   POST /api/messages/:userId
// @desc    Send a direct message (REST fallback when socket is unavailable)
// @access  Private
const sendDirectMessage = asyncHandler(async (req, res) => {
  const receiverId = req.params.userId;
  const senderId = req.user._id;
  const { content } = req.body;

  if (!content || !content.trim()) {
    res.status(400);
    throw new Error('Message content is required');
  }

  let newMessage = await Message.create({
    sender: senderId,
    receiver: receiverId,
    content: content.trim(),
    readBy: [senderId],
  });

  newMessage = await newMessage.populate('sender', 'name profilePicture');

  res.status(201).json({ success: true, data: newMessage });
});

// @route   POST /api/messages/trip/:tripId
// @desc    Send a trip group message (REST fallback when socket is unavailable)
// @access  Private
const sendTripMessage = asyncHandler(async (req, res) => {
  const tripId = req.params.tripId;
  const senderId = req.user._id;
  const { content } = req.body;

  if (!content || !content.trim()) {
    res.status(400);
    throw new Error('Message content is required');
  }

  let newMessage = await Message.create({
    sender: senderId,
    trip: tripId,
    content: content.trim(),
    readBy: [senderId],
  });

  newMessage = await newMessage.populate('sender', 'name profilePicture');

  res.status(201).json({ success: true, data: newMessage });
});

// @route   GET /api/messages/conversations
// @desc    Get list of recent conversations (1:1 and trips)
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;

  // Find all distinct receivers where I am sender
  const sentMessages = await Message.distinct('receiver', { sender: currentUserId, receiver: { $exists: true } });
  // Find all distinct senders where I am receiver
  const receivedMessages = await Message.distinct('sender', { receiver: currentUserId });

  const uniqueUserIds = [...new Set([...sentMessages, ...receivedMessages].map((id) => id.toString()))];

  const conversations = [];
  
  for (const uid of uniqueUserIds) {
    const latestMsg = await Message.findOne({
      $or: [
        { sender: currentUserId, receiver: uid },
        { sender: uid, receiver: currentUserId },
      ]
    })
    .populate('sender', 'name profilePicture')
    .populate('receiver', 'name profilePicture')
    .sort({ createdAt: -1 });

    if (latestMsg) {
      // The "other" user is whoever is not currentUserId
      const isSender = latestMsg.sender._id.toString() === currentUserId.toString();
      const otherUser = isSender ? latestMsg.receiver : latestMsg.sender;
      
      conversations.push({
        _id: otherUser._id,
        name: otherUser.name,
        profilePicture: otherUser.profilePicture,
        latestMessage: latestMsg.content,
        timestamp: latestMsg.createdAt,
        type: 'direct'
      });
    }
  }

  // Sort by latest message
  conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json({ success: true, data: conversations });
});

module.exports = { getDirectMessages, getTripMessages, getConversations, sendDirectMessage, sendTripMessage };
