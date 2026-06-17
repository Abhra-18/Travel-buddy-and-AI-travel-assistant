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
  });

  // Track online users: Map<userId, socketId>
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('🔗 New socket connection:', socket.id);

    // 1. User joins their personal room (for 1:1 messages and global notifications)
    socket.on('setup', (userData) => {
      if (!userData || !userData._id) return;
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

    // 5. Send new message
    socket.on('new_message', async (messageData) => {
      console.log('Received new_message from frontend:', messageData);
      try {
        const { sender, receiver, trip, content } = messageData;

        // Save to MongoDB
        let newMessage = await Message.create({
          sender: sender._id,
          receiver: receiver ? receiver._id : undefined,
          trip: trip ? trip : undefined,
          content,
          readBy: [sender._id],
        });

        newMessage = await newMessage.populate('sender', 'name profilePicture');

        // Broadcast the message
        if (trip) {
          // It's a trip group message -> send to the trip room
          io.to(trip).emit('message_received', newMessage);
        } else if (receiver) {
          // It's a 1:1 message -> send to receiver's personal room
          socket.to(receiver._id).emit('message_received', newMessage);
          // Also emit to sender (in case they have multiple tabs open)
          socket.emit('message_received', newMessage);
        }

      } catch (err) {
        console.error('Socket message save error:', err);
      }
    });

    // 6. Handle Disconnect
    socket.on('disconnect', () => {
      let disconnectedUserId = null;
      for (let [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }
      if (disconnectedUserId) {
        io.emit('online_users', Array.from(onlineUsers.keys()));
        console.log(`User ${disconnectedUserId} disconnected`);
      }
    });
  });

  return io;
};

module.exports = initSocketServer;
