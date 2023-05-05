# Audio Preloading and Synchronization

This project is a web application that preloads an audio file, displays a progress bar, and connects to a server via Socket.io. The server waits for console input to start audio playback simultaneously for all connected clients. The application's design is inspired by the Game Boy Color retro theme.

## Prerequisites

- Node.js
- npm

## Installation

1. Clone the repository:

```sh
$ git clone https://github.com/yourusername/your-repository.git
```

2. Navigate to the project directory:

```sh
$ cd your-repository
```

3. Install the required dependencies:

```sh
$ npm install
```

## Usage

1. Start the server:

```sh
$ npm start
```

2. Open your browser and navigate to the displayed local IP address and port number (e.g., `http://192.168.1.100:3000`).

3. The application will display a progress bar as it downloads the audio file. Once the download is complete, a "Connect" button will appear.

4. Click the "Connect" button to connect to the server.

5. On the server console, press 'Enter' to start audio playback for all connected clients.

## Customization

To use a different audio file, update the `audioFileUrl` variable in the `app.js` file with the path to your desired audio file:

```javascript
const audioFileUrl = 'path/to/your/audio/file.mp3';
```

To change the design, modify the `styles.css` file accordingly.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---
