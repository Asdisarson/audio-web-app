const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const readline = require('readline');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('./'));
const connectedUsers = {};
let clientsReady = 0;

io.on('connection', (socket) => {
  socket.on('adminConnected', () => {
    console.log('Admin connected');
    socket.emit('updateUserList', connectedUsers);
  });

  console.log('A user connected');
  socket.on('startPlayback', () => {
    console.log('Admin started playback');
    io.emit('play');
  });

  socket.on('clientConnected', (data) => {
    const { userId, latency } = data;
    connectedUsers[userId] = { latency };
    console.log(`Client connected and ready to play audio. User ID: ${userId}`);
    io.emit('updateUserList', connectedUsers);
  });

  socket.on('disconnect', () => {
    if (connectedUsers.hasOwnProperty(socket.id)) {
      delete connectedUsers[socket.id];
      io.emit('updateUserList', connectedUsers);
    }
    console.log('A user disconnected');
  });


});
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
