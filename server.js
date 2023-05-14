const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const readline = require('readline');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('./'));

let selectableUsers = {};
let group = 0;
let admin = "";
io.on('connection', (socket) => {

  socket.on('reset',() => {
    selectableUsers = {};
    socket.broadcast.emit('refresh');
  })

  socket.on('isAdmin',() => {
    admin = socket.id;
    console.log("Admin: " + admin);
  })

  console.log('A user connected: ' + socket.id);

    socket.on('clientConnected', () => {
      console.log('Connected user is Ready: ' + socket.id);

      selectableUsers[socket.id] = socket;
    });


  socket.on('userControl',(data) => {
    io.to(admin).emit('manipulate', data);
  })
        socket.on('disconnect', () => {
    console.log('A user disconnected: ' + socket.id);
  });
  socket.on('play', () => {
    socket.broadcast.emit('play');

    let intervalId;

    function selectRandomUser() {
      if (Object.keys(selectableUsers).length > 0) {
        let socketIds = Object.keys(selectableUsers);
        let randomSocketId = socketIds[Math.floor(Math.random() * socketIds.length)];
        console.log('Selected: ' + randomSocketId);
        io.to(randomSocketId).emit('selected');

        // Remove selected user so they can't be selected again
        //delete selectableUsers[randomSocketId];
      } else {
        // All users have been selected, so stop selecting
        clearInterval(intervalId);
      }
    }

    // Select first user immediately
    selectRandomUser();

    // Schedule selection of next user every 15 seconds
    intervalId = setInterval(selectRandomUser, 15000);
  });
  socket.on('checkConnection', () => {
    socket.emit('connectionOK');
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
