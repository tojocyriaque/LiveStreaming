const express = require('express');
const fs = require("fs")
const https = require("https")
const http = require('http');
const socketIo = require('socket.io');

const key = fs.readFileSync('key.pem', "utf8")
const cert = fs.readFileSync('cert.pem', "utf8")
const credentials = { cert: cert, key: key }

const app = express();
const server = https.createServer(credentials, app);
const io = socketIo(server);

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Serve static files (e.g., client-side JavaScript)
app.use(express.static(__dirname));

// Listen for socket connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle the incoming video stream from a client
    socket.on('video-stream', (frame) => {
        // Broadcast the frame to all clients except the sender
        socket.broadcast.emit('video-stream', frame);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
const PORT = 8000;
server.listen(PORT, () => {
    console.log(`Server running at https://0.0.0.0:${PORT}/`);
});
