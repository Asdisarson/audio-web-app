$(document).ready(function () {
  const audioFileUrl = './audio.m4a';
  const socket = io();
  const sound = new Howl({ src: [audioFileUrl] });

  const isAdmin = window.location.search.includes('admin=true');
  if (isAdmin) {
    $('#adminDashboard').show();
    socket.emit('adminConnected');
    socket.on('updateUserList', (users) => {
      const userList = $('#userList');
      userList.empty();
      for (const [userId, userData] of Object.entries(users)) {
        userList.append(`<li>User ID: ${userId} | Latency: ${userData.latency} ms</li>`);
      }
    });

    $('#startPlayback').on('click', () => {
      socket.emit('startPlayback');
    });
  }
  else {
    // Preload audio file
    const downloadFile = (url, onProgress, onComplete) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';

      xhr.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(Math.round(percentComplete));
        }
      };

      xhr.onload = () => {
        onComplete(xhr.response);
      };

      xhr.send();
    };

    downloadFile(
      audioFileUrl,
      (progress) => {
        $('#progress').css('width', progress + '%');
        if (progress === 100) {
          $('#downloadStatus').text('Download completed. Click Connect to start.');
          $('#connect').show();
          $('#preloader').hide();
        }
      },
      (response) => {
        sound.load();
      }
    );

    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    $('#connect').on('click', () => {
      const latency = Math.floor(Math.random() * 1000); // Generate a random latency value for demonstration purposes
      socket.emit('clientConnected', { userId, latency });
    });
    // Connect to the server and listen for the 'play' event
    $('#connect').on('click', () => {

      socket.on('play', () => {
        sound.play();
      });

      socket.emit('clientConnected');
    });

  }
});
