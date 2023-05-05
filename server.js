const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const readline = require('readline');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('./'));

let clientsReady = 0;

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('clientConnected', () => {
    clientsReady++;
    console.log(`Client connected and ready to play audio. Total clients ready: ${clientsReady}`);

    if (clientsReady === 1) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question("Press 'Enter' to start playback for all clients: ", () => {
        io.emit('play');
        console.log('Playback started for all clients.');
        rl.close();
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    clientsReady--;
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
