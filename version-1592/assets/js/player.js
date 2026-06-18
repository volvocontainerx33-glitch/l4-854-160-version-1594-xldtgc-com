(function () {
  var HLS_CDN_URLS = [
    'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js',
    'https://unpkg.com/hls.js@1.5.18/dist/hls.min.js'
  ];

  var hlsLoadPromise = null;

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function ensureHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!hlsLoadPromise) {
      hlsLoadPromise = HLS_CDN_URLS.reduce(function (promise, url) {
        return promise.catch(function () {
          return loadScript(url);
        });
      }, Promise.reject()).then(function () {
        return window.Hls;
      });
    }

    return hlsLoadPromise;
  }

  function setHidden(element, hidden) {
    if (element) {
      element.hidden = hidden;
    }
  }

  function setMessage(element, message) {
    if (element) {
      element.textContent = message;
      element.hidden = !message;
    }
  }

  function initializePlayer(container) {
    var video = container.querySelector('video');
    var playButton = container.querySelector('[data-play]');
    var loading = container.querySelector('[data-loading]');
    var message = container.querySelector('[data-message]');
    var sourceUrl = container.getAttribute('data-src');
    var hlsInstance = null;
    var initialized = false;

    if (!video || !sourceUrl) {
      setMessage(message, '视频播放源缺失。');
      return;
    }

    function showLoading(isLoading) {
      setHidden(loading, !isLoading);
    }

    function showError(text) {
      showLoading(false);
      setMessage(message, text);
    }

    function playWhenReady() {
      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          setMessage(message, '浏览器阻止了自动播放，请再次点击播放按钮。');
        });
      }
    }

    function attachNative() {
      video.src = sourceUrl;
      video.controls = true;
      video.addEventListener('loadedmetadata', function () {
        showLoading(false);
        playWhenReady();
      }, { once: true });
      video.addEventListener('error', function () {
        showError('视频加载失败，请稍后重试。');
      }, { once: true });
      video.load();
    }

    function attachHls(Hls) {
      if (!Hls || !Hls.isSupported()) {
        showError('当前浏览器暂不支持 HLS 播放。');
        return;
      }

      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        video.controls = true;
        showLoading(false);
        playWhenReady();
      });

      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
          return;
        }

        showError('视频加载失败，请稍后重试。');
      });
    }

    function start() {
      setMessage(message, '');
      setHidden(playButton, true);
      showLoading(true);

      if (initialized) {
        showLoading(false);
        playWhenReady();
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        attachNative();
        return;
      }

      ensureHls()
        .then(attachHls)
        .catch(function () {
          showError('HLS 播放器加载失败，请检查网络后重试。');
        });
    }

    if (playButton) {
      playButton.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!initialized) {
        start();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initializePlayer);
  });
})();
