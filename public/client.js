// client.js
const socket = io();
const videoElement = document.getElementById('video');
let isStreamer = false;

// Function to become a streamer
function becomeStreamer() {
    isStreamer = true;
    socket.emit('becomeStreamer');

    // Request access to the user's camera and microphone
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (event) => {
                socket.emit('stream', event.data);
            };
            mediaRecorder.start(100); // Collect data every 100ms

            // Play the stream in the video element for the streamer
            videoElement.srcObject = stream;
        })
        .catch(error => {
            console.error('Error accessing media devices.', error);
        });

}

// Function to become a spectator
function becomeSpectator() {
    isStreamer = false;
    console.log("Spectator");
    socket.emit('spectator');
}

// Receive and play the stream for spectators
socket.on('stream', (data) => {
    if (!isStreamer) {
        const videoBlob = new Blob([data]);
        const objectURL = URL.createObjectURL(videoBlob);
        videoElement.src = objectURL;
        // videoElement.play().catch(error => {
        //     console.error('Error playing video:', error);
        // });
        console.log("Stream URL:", objectURL);
    }
});

// Update the video element when the streamer changes
socket.on('updateStreamer', (streamerId) => {
    if (isStreamer) {
        // The user is a streamer, they should see their own video
        socket.emit('requestStream');
    }
});
