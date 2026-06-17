const { Server } = require('socket.io');
const Message = require('../models/Message');

const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          origin.endsWith('.vercel.app') ||
          origin === 'http://localhost:5173' ||
          origin === process.env.CLIENT_URL
        ) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'), false);
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Tuned for Render free tier — longer timeouts to survive cold starts
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000,
    // Allow transport upgrade
    transports: ['websocket', 'polling'],
  });

  // Track online users: Map<userId, socketId>
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('🔗 New socket connection:', socket.id);

    // 1. User joins their personal room (for 1:1 messages and global notifications)
    socket.on('setup', (userData) => {
      if (!userData || !userData._id) return;
      socket.userId = userData._id; // Store userId on the socket for cleanup
      socket.join(userData._id);
      onlineUsers.set(userData._id, socket.id);
      socket.emit('connected');
      io.emit('online_users', Array.from(onlineUsers.keys()));
      console.log(`User ${userData._id} connected and joined personal room`);
    });

    // 2. User joins a specific trip group room
    socket.on('join_trip', (tripId) => {
      socket.join(tripId);
      console.log(`User joined trip room: ${tripId}`);
    });

    // 3. User leaves a specific trip group room
    socket.on('leave_trip', (tripId) => {
      socket.leave(tripId);
      console.log(`User left trip room: ${tripId}`);
    });

    // 4. Handle Typing indicator
    socket.on('typing', ({ room, user }) => socket.to(room).emit('typing', user));
    socket.on('stop_typing', (room) => socket.to(room).emit('stop_typing'));

    // 5. Send new message — saves to DB and broadcasts
    socket.on('new_message', async (messageData) => {
      console.log('Received new_message from frontend:', messageData);
      try {
        const { sender, receiver, trip, content } = messageData;

        if (!sender || !sender._id || !content) {
          console.error('Invalid message data: missing sender or content');
          return;
        }

        // Save to MongoDB
        let newMessage = await Message.create({
          sender: sender._id,
          receiver: receiver ? receiver._id : undefined,
          trip: trip || undefined,
          content,
          readBy: [sender._id],
        });

        newMessage = await newMessage.populate('sender', 'name profilePicture');

        // Broadcast the message
        if (trip) {
          // Trip group message -> send to the entire trip room (all members including sender)
          io.to(trip).emit('message_received', newMessage);
        } else if (receiver) {
          // 1:1 message -> send to receiver's personal room
          socket.to(receiver._id).emit('message_received', newMessage);
          // Also send back to sender so their UI updates with the DB-saved version
          socket.emit('message_received', newMessage);
        }

        // Acknowledge to the sender that the message was saved successfully
        socket.emit('message_saved', {
          success: true,
          tempId: messageData.tempId, // Frontend sends a tempId to correlate
          savedMessage: newMessage,
        });

      } catch (err) {
        console.error('Socket message save error:', err);
        // Notify sender of failure so they can retry
        socket.emit('message_error', {
          tempId: messageData.tempId,
          error: 'Failed to save message. Please try again.',
        });
      }
    });

    // 6. Handle Disconnect
    socket.on('disconnect', (reason) => {
      const userId = socket.userId;
      if (userId && onlineUsers.get(userId) === socket.id) {
        onlineUsers.delete(userId);
        io.emit('online_users', Array.from(onlineUsers.keys()));
        console.log(`User ${userId} disconnected (reason: ${reason})`);
      }
    });
  });

  return io;
};

module.exports = initSocketServer;
