$(document).ready(function () {
  const audioFileUrl = './audio.m4a';
  const socket = io();
  const sound = new Howl({ src: [audioFileUrl] });

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

  // Connect to the server and listen for the 'play' event
  $('#connect').on('click', () => {
    socket.on('play', () => {
      sound.play();
    });

    socket.emit('clientConnected');
  });
});
