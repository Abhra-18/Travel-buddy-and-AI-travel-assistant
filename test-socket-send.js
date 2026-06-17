const io = require('socket.io-client');

const socket = io('https://travel-buddy-and-ai-travel-assistant.onrender.com', {
  transports: ['websocket', 'polling'],
  withCredentials: true
});

socket.on('connect', () => {
  console.log('Connected');
  
  socket.emit('setup', { _id: '6a32572ee1a9682bf98f3407', name: 'System Test' });

  // Simulate sending a message to the same user (self)
  socket.emit('new_message', {
    sender: { _id: '6a32572ee1a9682bf98f3407', name: 'System Test' },
    receiver: { _id: '6a32572ee1a9682bf98f3407' },
    content: 'Hello World'
  });
});

socket.on('message_received', (msg) => {
  console.log('RECEIVED MESSAGE:', msg);
  process.exit(0);
});

setTimeout(() => {
  console.log('Timeout waiting for message');
  process.exit(1);
}, 5000);
