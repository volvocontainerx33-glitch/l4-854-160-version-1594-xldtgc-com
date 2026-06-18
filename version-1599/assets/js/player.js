document.addEventListener("DOMContentLoaded", function () {
  var player = document.getElementById("movie-player");

  if (!player) {
    return;
  }

  var source = player.getAttribute("data-src");

  if (!source) {
    return;
  }

  if (player.canPlayType("application/vnd.apple.mpegurl")) {
    player.src = source;
    return;
  }

  var note = document.createElement("p");
  note.className = "player-warning";
  note.textContent = "当前浏览器可能不支持直接播放 HLS 视频流，请使用支持 HLS 的浏览器查看。";
  player.insertAdjacentElement("afterend", note);
});
