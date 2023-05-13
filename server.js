const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('./'));
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const ifaceName in interfaces) {
    const iface = interfaces[ifaceName];
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return '127.0.0.1';
}
const PORT = process.env.PORT || 3000;
const localIP = getLocalIP();

server.listen(PORT, () => {
  console.log(`Server is running on http://${localIP}:${PORT}`);
});

io.on('connection', (socket) => {

  socket.on('adminConnected', () => {
    console.log('Admin')
  });

  // Handle new admin events
  socket.on('gMinor', () => {
    io
    .emit('gMinor');
  });

  socket.on('soundsOff', () => {
    io.emit('soundsOff');
  });
  socket.on('random', () => {
    console.log(io.sockets.connected)
    // Get an array of all connected socket IDs
    const socketIds = Object.keys(io.sockets.connected);
  
    for (let i = 0; i < socketIds.length; i++) {
      // Get the socket object for the current client
      const socket = io.sockets.connected[socketIds[i]];
      
      // Emit the 'random' event to the current client
      socket.emit('random');
    }
  });
  

  socket.on('play', () => {
    io.emit('play');
  });


  socket.on('clientConnected', () => {
    console.log(`Client connected and ready to play audio.`);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });


});