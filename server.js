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
let computer = "";
let counter = 0;
io.on('connection', (socket) => {
    socket.on('reset', () => {
        test = false;
        counter = 19;
        selectableUsers = {};
        io.emit('refresh');
    })
    socket.on('setAdmin', () => {
        admin = socket.id;
        console.log("admin: " + admin);
    })
    socket.on('mainAdmin', () => {
        test = false;
        selectableUsers = {};
        io.emit('main');
    })

    socket.on('testAdmin', () => {
        test = true;
        selectableUsers = {};
        io.emit('test');
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
        let intervalId;
         counter = 0;
        let playSongId;
        io.emit('playSongFull');
        function playSong() {
            if (13 > counter) {

                    console.log('Playback started: ' + counter)
                io.to(admin).emit('playSong', counter.toString());
                    counter++;
            } else {
                clearInterval(playSongId);
            }
        }

        function selectRandomUser() {
            if (counter < 13 && counter !== 9) {
                if (Object.keys(selectableUsers).length > 0) {
                    let socketIds = Object.keys(selectableUsers);
                    let randomSocketId = socketIds[Math.floor(Math.random() * socketIds.length)];
                    console.log('Selected: ' + randomSocketId);
                    io.to(randomSocketId).emit('selected');

                    // Remove selected user so they can't be selected again
                    delete selectableUsers[randomSocketId];
                }
                else {
                    // All users have been selected, so stop selecting
                    clearInterval(intervalId);
                }
            }
            else {
                // All users have been selected, so stop selecting
                clearInterval(intervalId);
            }
        }
        selectRandomUser();

        intervalId = setInterval(selectRandomUser, 20000);
        if(test){
            console.log('Test started')
            socket.emit('playSong', 'full');
        }
    else {
            // Select first user immediately
            playSong();
            // Schedule selection of next user every 15 seconds
            playSongId = setInterval(playSong, 30000);
        }
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
