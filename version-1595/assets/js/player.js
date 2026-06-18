(function () {
    function initPlayer(shell) {
        var video = shell.querySelector("video");
        var overlay = shell.querySelector(".player-overlay");

        if (!video || !overlay) {
            return;
        }

        var stream = video.getAttribute("data-stream");
        var hls = null;
        var ready = false;

        function playVideo() {
            var result = video.play();

            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        function prepare() {
            if (ready) {
                playVideo();
                return;
            }

            ready = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls();
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
            } else {
                video.src = stream;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
            }
        }

        overlay.addEventListener("click", function () {
            overlay.classList.add("is-hidden");
            prepare();
        });

        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });

        video.addEventListener("click", function () {
            if (video.paused) {
                prepare();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll("[data-player]").forEach(initPlayer);
})();
