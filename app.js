$(document).ready(function () {
    var buttonValue; // Declare the variable
    let audioFileUrl = './test.m4a';
    const soundBank = ['./audio/audio0.m4a', './audio/audio1.m4a', './audio/audio2.m4a', './audio/audio3.m4a', './audio/audio4.m4a']
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin');

    $('#color .gameboy-button').on('click', function() {
        buttonValue = $(this).val(); // Set the variable to the value of the clicked button
        audioFileUrl = soundBank[buttonValue];
        const socket = io();
        $('#preloader').show();
        $('#color').hide();
        if (isAdmin === 'true') {
            audioFileUrl = "./audio/audio.m4a"
            socket.emit('isAdmin');
        }
    // Get the URL parameters


// Retrieve the value of the "admin" parameter

// Check if the "admin" parameter is set to true

    console.log(audioFileUrl);
    const sound = new Howl({src: [audioFileUrl]});

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
                $('#preloader').fadeOut(500);
                $('#connect').fadeIn(1000);
            }
        },
        (response) => {
            sound.load();
        }
    );
    if(isAdmin) {
        $('.container').hide();
        $('#adminDashboard').show();
         // Enable wake lock
        $('#adminPlay').on('click',() => {
            $('#adminPlay').hide();
            const noSleep = new NoSleep();
            noSleep.enable();
            socket.emit('play');
            sound.play();
            socket.on('manipulate', (data) => {
                sound.stereo(data.pan);
                sound.rate(data.rate);
            })
        })
        setInterval(() => {
            socket.emit('checkConnection');
        }, 5000);
    }
    else {
        // Connect to the server and listen for the 'play' event
        $('#connect').on('click', () => {
            const noSleep = new NoSleep();
            noSleep.enable();  // Enable wake lock
            socket.emit('clientConnected');

            socket.on('play', () => {
                sound.play();
            });
            $('#connect').hide();
            $('#connection').fadeIn(200);
            socket.on('selected', () => {
                $('#connection').hide();
                // Countdown

                var countdownNumber = 5;
                $('#countdown').text(countdownNumber);
                $('#countdown').show();

                var countdownInterval = setInterval(function () {
                    countdownNumber--;
                    $('#countdown').text(countdownNumber);

                    if (countdownNumber <= 0) {
                        clearInterval(countdownInterval);
                        $('#countdown').hide();
                        $('#circle').show();
                    }
                }, 1000);
                $('#circle').on('touchmove', function (e) {
                    e.preventDefault();

                    var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                    var elm = $(this).offset();
                    var x = touch.pageX - elm.left;
                    var y = touch.pageY - elm.top;
                    var w = $(this).width();
                    var h = $(this).height();

                    // Calculate rate from y position
                    var rate = y / h;
                    rate = Math.max(Math.min(rate * 2, 2.0), 0.5);

                    // Calculate pan from x position
                    var pan = (x / w) * 2 - 1;// Convert x position to range -1 to 1
                    socket.emit('userControl', {
                        pan: pan,
                        rate: rate
                    });
                });

                setTimeout(function () {
                    socket.emit('userControl', {
                        pan: -1,
                        rate: 1
                    });
                    $('#circle').hide();
                    $('#connected').show();
                }, 15000);

            });


            setInterval(() => {
                socket.emit('checkConnection');
            }, 15000);
        });
    }
   socket.on('connectionOK', () => {
        console.log('Connection is up.');
    });
});
});
