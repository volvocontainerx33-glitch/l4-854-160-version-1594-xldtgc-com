import { H as Hls } from './hls-dru42stk.js';

function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

ready(function () {
  var players = document.querySelectorAll('[data-player]');
  players.forEach(initPlayer);
});

function initPlayer(shell) {
  var video = shell.querySelector('video[data-src]');
  var overlay = shell.querySelector('.player-overlay');
  var message = shell.querySelector('.player-message');
  var source = video ? video.getAttribute('data-src') : '';
  var hlsInstance = null;
  var hasStarted = false;

  if (!video || !overlay) {
    return;
  }

  function showMessage(text) {
    if (!message) {
      return;
    }
    message.hidden = false;
    message.textContent = text;
  }

  function startPlayback() {
    if (!source) {
      showMessage('当前条目没有可用播放源。');
      return;
    }

    overlay.classList.add('is-loading');

    if (!hasStarted) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            showMessage('播放源加载失败，请稍后重试或更换浏览器。');
            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
            }
          }
        });
      } else {
        showMessage('当前浏览器不支持 HLS 播放。');
        return;
      }
      hasStarted = true;
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(function () {
          overlay.classList.add('is-hidden');
        })
        .catch(function () {
          showMessage('浏览器阻止了自动播放，请再次点击播放器。');
          overlay.classList.remove('is-loading');
        });
    } else {
      overlay.classList.add('is-hidden');
    }
  }

  overlay.addEventListener('click', startPlayback);

  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });

  video.addEventListener('pause', function () {
    if (!video.ended) {
      overlay.classList.remove('is-hidden');
      overlay.classList.remove('is-loading');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
