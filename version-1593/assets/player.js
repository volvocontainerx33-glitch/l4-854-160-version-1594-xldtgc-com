(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        document.querySelectorAll('[data-player]').forEach(function (player) {
            var video = player.querySelector('.hls-player');
            var startButton = player.querySelector('[data-player-start]');
            var message = player.querySelector('[data-player-message]');
            var hls = null;
            var initialized = false;

            function setMessage(text) {
                if (message) {
                    message.textContent = text || '';
                }
            }

            function initialize() {
                if (!video || initialized) {
                    return;
                }
                var source = video.getAttribute('data-video-src');
                if (!source) {
                    setMessage('未找到播放源。');
                    return;
                }

                initialized = true;
                setMessage('正在初始化播放源...');

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setMessage('播放源已就绪。');
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage('视频加载失败，请稍后重试或更换浏览器。');
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        setMessage('播放源已就绪。');
                    });
                    video.addEventListener('error', function () {
                        setMessage('视频加载失败，请稍后重试。');
                    });
                } else {
                    setMessage('当前浏览器不支持 HLS 播放，请使用 Chrome、Edge、Safari 或安装支持 HLS 的浏览器。');
                }
            }

            function playVideo() {
                initialize();
                if (!video) {
                    return;
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        setMessage('请再次点击播放按钮开始观看。');
                    });
                }
            }

            if (startButton) {
                startButton.addEventListener('click', playVideo);
            }
            if (video) {
                video.addEventListener('play', function () {
                    if (startButton) {
                        startButton.classList.add('is-hidden');
                    }
                    setMessage('');
                });
                video.addEventListener('pause', function () {
                    if (startButton && video.currentTime === 0) {
                        startButton.classList.remove('is-hidden');
                    }
                });
                video.addEventListener('ended', function () {
                    if (startButton) {
                        startButton.classList.remove('is-hidden');
                    }
                });
            }

            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    });
})();
