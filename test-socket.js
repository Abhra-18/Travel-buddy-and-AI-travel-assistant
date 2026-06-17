const io = require('socket.io-client');

const socket = io('https://travel-buddy-and-ai-travel-assistant.onrender.com', {
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('Successfully connected to socket server. ID:', socket.id);
  process.exit(0);
});

socket.on('connect_error', (err) => {
  console.error('Connection error:', err.message);
  process.exit(1);
});

// timeout
setTimeout(() => {
  console.log('Timeout waiting for connection');
  process.exit(1);
}, 5000);
