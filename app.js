$(document).ready(function () {
    var buttonValue; // Declare the variable
    let audioFileUrl = './test.m4a';
    let soundBank = ['./audio/audio0.m4a', './audio/audio1.m4a', './audio/audio2.m4a']
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin');
    let test = urlParams.get('test');
    if (test === 'true') {
        soundBank = ['./audio/test1.m4a', './audio/test.m4a', './audio/test2.m4a']
    }
    const socket = io();
    $('#color .gameboy-button').on('click', function () {
        buttonValue = $(this).val(); // Set the variable to the value of the clicked button
        audioFileUrl = soundBank[buttonValue];
        $('#preloader').show();
        $('#color').hide();
        if (isAdmin === 'true') {
            audioFileUrl = "./audio/audio.m4a";
            if (test === 'true') {
                audioFileUrl = "./audio/test3.m4a"
            }
            socket.emit('isAdmin');
        }
        // Get the URL parameters


// Retrieve the value of the "admin" parameter

// Check if the "admin" parameter is set to true

        console.log(audioFileUrl);
        const sound = new Howl({
            src: [audioFileUrl],
            sprite: {
                0: [0, 31000],
                1: [30000, 31000],
                2: [60000, 31000],
                3: [90000, 31000],
                4: [120000, 31000],
                5: [150000, 31000],
                6: [180000, 31000],
                7: [210000, 31000],
                8: [240000, 31000],
                9: [270000, 31000],
                10: [300000, 31000],
                11: [330000, 31000],
                12: [360000, 31000],
                full: [0, 390000]
            }
        });

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
        if (isAdmin) {
            $('.container').hide();
            $('#adminDashboard').show();
            $('#reset').on('click', () => {
                socket.emit('reset');
                sound.stop();
                $('#adminPlay').show();
            });
            if (test === 'true') {
                $('#test').hide();
                $('#main').on('click', () => {
                    socket.emit('mainAdmin');
                });
        }
           else {
                $('#main').hide();
                $('#test').on('click', () => {
                    socket.emit('testAdmin');
                });
            }
            // Enable wake lock
            $('#adminPlay').on('click', () => {
                $('#adminPlay').hide();
                const noSleep = new NoSleep();
                noSleep.enable();
                socket.emit('play');
                socket.on('playSong', (data) => {

                    sound.play(data);
                })
                socket.on('manipulate', (data) => {

                    if (data) {
                        sound.stereo(data.pan);
                        sound.rate(data.rate);
                    }
                })
            })
            setInterval(() => {
                socket.emit('checkConnection');
            }, 5000);
        } else {
            socket.on('refresh', () => {
                window.location.reload();
            })
            // Connect to the server and listen for the 'play' event
            $('#connect').on('click', () => {
                const noSleep = new NoSleep();
                noSleep.enable();  // Enable wake lock
                socket.emit('clientConnected');

                socket.on('playSongFull', () => {
                    console.log();
                    sound.play('full');
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

                    function enableTouch() {
                        $('#circle').on('touchmove', touchMoveHandler);
                        setTimeout(function () {
                            $('#circle').off('touchmove', touchMoveHandler);
                            socket.emit('userControl', {
                                pan: 0,
                                rate: 1
                            });
                            setTimeout(enableTouch, 3000); // Re-enable after 3 seconds
                        }, 3000); // Disable after 3 seconds
                    }

                    function touchMoveHandler(e) {
                        e.preventDefault();

                        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                        var elm = $(this).offset();
                        var x = touch.pageX - elm.left;
                        var y = touch.pageY - elm.top;
                        var w = $(this).width();
                        var h = $(this).height();

                        // Calculate rate from y position
                        var rate = y / h;
                        rate = Math.max(Math.min(rate * 1.05, 1.25), 0.25);

                        // Calculate pan from x position
                        var pan = (x / w) * 2 - 1; // Convert x position to range -1 to 1
                        socket.emit('userControl', {
                            pan: pan,
                            rate: rate
                        });
                    }

                    enableTouch();


                    setTimeout(function () {

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
    })

    socket.on('main', () => {
            let url = window.location.origin;

            if (isAdmin) {
                 let params = $.param({
                     admin: "true",
                });
                url += "?" + params;
            }

            window.location.href = url;
        })
        socket.on('test', () => {
            let url = window.location.origin;
            let params = $.param({
                test: "true",
            });
            if (isAdmin) {
                params = $.param({
                    test: "true", admin: "true",
                });
            }
            url += "?" + params;

            window.location.href = url;
        })

});
