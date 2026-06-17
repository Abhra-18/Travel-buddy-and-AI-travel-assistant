const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // For 1-to-1 chats
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // For Group Trip chats
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
    },
    content: {
      type: String,
      required: true,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', MessageSchema);
