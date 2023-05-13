$(document).ready(function () {
  const audioFileUrl = ['./audio0.m4a', './audio1.m4a', './audio2.m4a', './audio3.m4a', './audio4.m4a'];
  const socket = io();
  const sound = [new Howl({ src: [audioFileUrl[0]] }),
  new Howl({ src: [audioFileUrl[1]] }),
  new Howl({ src: [audioFileUrl[2]] }),
  new Howl({ src: [audioFileUrl[3]] }),
  new Howl({ src: [audioFileUrl[4]] })];

  const isAdmin = window.location.search.includes('admin=true');
  if (isAdmin) {
    $('.container').hide();
    $('#adminDashboard').show();
    socket.emit('adminConnected');
    $('#gMinor').on('click', () => {
      socket.emit('gMinor');

    });
    $('#soundsOff').on('click', () => {
      socket.emit('soundsOff');

    });
    $('#random').on('click', () => {
      socket.emit('random');

    });
    $('#play').on('click', () => {
      socket.emit('play');

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
    for (let i = 0; i < audioFileUrl.length; i++) {


      downloadFile(
        audioFileUrl[i],
        (progress) => {
          $('#progress').css('width', progress + '%');
          if (progress === 100 && ((i + 1) === audioFileUrl.length)) {
            $('#downloadStatus').text('Download completed. Click Connect to start.');
            $('#connect').show();
            $('#preloader').hide();
          }
        },
        (response) => {
          sound[i].load();
        }
      );
    }
    $('#connect').on('click', () => {
      socket.emit('clientConnected');
      // Connect to the server and listen for the 'play' event
      $('#connected').show();
      $('#connect').hide();
      socket.on('gMinor', () => {
        // Randomly select a note from G-minor scale within the specified frequency range
        const note = randomNoteFromGMinor();
        synth.triggerAttackRelease(note, "8n");
      });

      socket.on('soundsOff', () => {
        for (let i = 0; i < sound.length; i++) {
          sound[i].stop();

        }
        // Stop all sounds
        synth.triggerRelease();
      });

      socket.on('play', () => {
        var i = Math.floor(Math.random() * 5);
        // Play the random sound from the soundbank
        sound[i].play();
      });

      socket.on('random', () => {
        var i = Math.floor(Math.random() * 5);
        // Play the random sound from the soundbank
        sound[i].play();
      });
    });


  }
});
