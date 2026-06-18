(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var opened = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(opened));
      document.body.classList.toggle("no-scroll", opened);
    });
  }

  var hero = document.querySelector("[data-hero-carousel]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  var searchInput = document.querySelector(".movie-search");
  var filters = Array.prototype.slice.call(document.querySelectorAll(".movie-filter"));
  var grids = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid"));
  var emptyState = document.querySelector(".empty-state");

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilter() {
    var keyword = normalize(searchInput ? searchInput.value : "");
    var filterValues = {};

    filters.forEach(function (filter) {
      filterValues[filter.getAttribute("data-filter")] = normalize(filter.value);
    });

    var visible = 0;

    grids.forEach(function (grid) {
      Array.prototype.slice.call(grid.children).forEach(function (item) {
        var haystack = normalize([
          item.getAttribute("data-title"),
          item.getAttribute("data-region"),
          item.getAttribute("data-type"),
          item.getAttribute("data-year"),
          item.getAttribute("data-tags")
        ].join(" "));
        var matched = !keyword || haystack.indexOf(keyword) !== -1;

        Object.keys(filterValues).forEach(function (key) {
          var selected = filterValues[key];

          if (selected && normalize(item.getAttribute("data-" + key)).indexOf(selected) === -1) {
            matched = false;
          }
        });

        item.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilter);
  }

  filters.forEach(function (filter) {
    filter.addEventListener("change", applyFilter);
  });
})();

var MoviePlayer = (function () {
  function mount(videoSelector, buttonSelector, streamUrl) {
    var video = document.querySelector(videoSelector);
    var button = document.querySelector(buttonSelector);
    var hlsInstance = null;
    var loaded = false;

    if (!video || !button || !streamUrl) {
      return;
    }

    function setStream() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      setStream();
      button.classList.add("is-hidden");
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", play);

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        button.classList.remove("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      button.classList.remove("is-hidden");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  return {
    mount: mount
  };
})();
