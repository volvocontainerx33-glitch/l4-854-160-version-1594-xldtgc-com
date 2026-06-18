(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        schedule();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        schedule();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        schedule();
      });
    }
    schedule();
  }

  function setupSearch() {
    var entries = window.siteSearchIndex || [];
    var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-search-box]"));
    boxes.forEach(function (box) {
      var input = box.querySelector("[data-search-input]");
      var results = box.querySelector("[data-search-results]");
      if (!input || !results) {
        return;
      }

      function render() {
        var keyword = input.value.trim().toLowerCase();
        if (!keyword) {
          results.classList.remove("is-open");
          results.innerHTML = "";
          return;
        }
        var matches = entries.filter(function (item) {
          return (item.title + " " + item.year + " " + item.region + " " + item.type + " " + item.genre + " " + item.oneLine).toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 10);
        if (!matches.length) {
          results.innerHTML = '<div class="search-result-item"><strong>暂无匹配影片</strong><span>换个关键词试试</span></div>';
          results.classList.add("is-open");
          return;
        }
        results.innerHTML = matches.map(function (item) {
          return '<a class="search-result-item" href="' + item.url + '"><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span></a>';
        }).join("");
        results.classList.add("is-open");
      }

      input.addEventListener("input", render);
      input.addEventListener("focus", render);
      document.addEventListener("click", function (event) {
        if (!box.contains(event.target)) {
          results.classList.remove("is-open");
        }
      });
    });
  }

  function setupLocalFilters() {
    var list = document.querySelector("[data-local-list]");
    if (!list) {
      return;
    }
    var search = document.querySelector("[data-local-search]");
    var year = document.querySelector("[data-local-year]");
    var type = document.querySelector("[data-local-type]");
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

    function apply() {
      var keyword = search ? search.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var typeValue = type ? type.value : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-type") + " " + card.getAttribute("data-year")).toLowerCase();
        var matched = true;
        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (yearValue && card.getAttribute("data-year") !== yearValue) {
          matched = false;
        }
        if (typeValue && card.getAttribute("data-type") !== typeValue) {
          matched = false;
        }
        card.classList.toggle("is-hidden", !matched);
      });
    }

    [search, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function setupPlayer() {
    var video = document.querySelector("[data-player]");
    if (!video) {
      return;
    }
    var url = video.getAttribute("data-video");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-start-play]"));
    var attached = false;
    var hls = null;

    function attach() {
      if (attached) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 60,
          backBufferLength: 30
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      attached = true;
    }

    function play() {
      attach();
      buttons.forEach(function (button) {
        button.classList.add("is-hidden");
      });
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", play);
    });
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      buttons.forEach(function (button) {
        button.classList.add("is-hidden");
      });
    });
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupLocalFilters();
    setupPlayer();
  });
})();
