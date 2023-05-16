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
let test = false;
io.on('connection', (socket) => {
    socket.on('reset', () => {
        test = false;
        admin = socket.id;
        selectableUsers = {};
        io.emit('refresh');
    })
    socket.on('mainAdmin', () => {
        if (admin !== "") {
            admin = socket.id;
        }
        test = false;
        selectableUsers = {};
        io.emit('main');
    })

    socket.on('testAdmin', () => {
        if (admin !== "") {
            admin = socket.id;
        }
        test = true;
        selectableUsers = {};
        io.emit('test');
    })
    socket.on('isAdmin', () => {
        if (admin !== "") {
            admin = socket.id;
            console.log("Admin: " + admin);
        }
    })

    console.log('A user connected: ' + socket.id);

    socket.on('clientConnected', () => {
        console.log('Connected user is Ready: ' + socket.id);

        selectableUsers[socket.id] = socket;
    });


    socket.on('userControl', (data) => {
        io.to(admin).emit('manipulate', data);
    })
    socket.on('disconnect', () => {
        console.log('A user disconnected: ' + socket.id);
    });
    let i = 0;
    socket.on('play', () => {
        console.log('Playback started')
        let intervalId;
        let counter = 0;
        let playSongId;
        io.emit('playSongFull');
        function playSong() {
            if (13 > counter) {

                if(test){
                    console.log('Test started')
                    socket.emit('playSong', 'full');
                    clearInterval(playSongId);
                }
                else {
                    console.log('Playback started')
                    socket.emit('playSong', counter.toString());
                    counter++;
                }
            } else {
                clearInterval(playSongId);
            }
        }

        function selectRandomUser() {
            if (counter >= 1 && counter !== 9) {
                if (Object.keys(selectableUsers).length > 0) {
                    let socketIds = Object.keys(selectableUsers);
                    let randomSocketId = socketIds[Math.floor(Math.random() * socketIds.length)];
                    console.log('Selected: ' + randomSocketId);
                    io.to(randomSocketId).emit('selected');

                    // Remove selected user so they can't be selected again
                    delete selectableUsers[randomSocketId];
                }
            } else {
                // All users have been selected, so stop selecting
                clearInterval(intervalId);
            }
        }

        // Select first user immediately
        selectRandomUser();
        playSong();
        // Schedule selection of next user every 15 seconds
        intervalId = setInterval(selectRandomUser, 15000);
        playSongId = setInterval(playSong, 30000);
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
