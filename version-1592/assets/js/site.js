(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('nav-open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var previous = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupFiltering() {
    var grid = document.querySelector('[data-filter-grid]');

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
    var keywordInput = document.querySelector('[data-filter-keyword]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var genreSelect = document.querySelector('[data-filter-genre]');
    var sortSelect = document.querySelector('[data-filter-sort]');
    var visibleCount = document.querySelector('[data-visible-count]');
    var noResults = document.querySelector('[data-no-results]');

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
    }

    function matches(card) {
      var keyword = normalize(keywordInput && keywordInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var genre = normalize(genreSelect && genreSelect.value);
      var text = cardText(card);

      if (keyword && text.indexOf(keyword) === -1) {
        return false;
      }

      if (region && normalize(card.getAttribute('data-region')) !== region) {
        return false;
      }

      if (type && normalize(card.getAttribute('data-type')) !== type) {
        return false;
      }

      if (year && normalize(card.getAttribute('data-year')) !== year) {
        return false;
      }

      if (genre && normalize(card.getAttribute('data-genre')).indexOf(genre) === -1) {
        return false;
      }

      return true;
    }

    function sortCards() {
      var mode = sortSelect ? sortSelect.value : 'rank';

      cards.sort(function (a, b) {
        if (mode === 'year') {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        }

        if (mode === 'score') {
          return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
        }

        if (mode === 'title') {
          return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
        }

        return Number(a.getAttribute('data-rank')) - Number(b.getAttribute('data-rank'));
      });

      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    function applyFilters() {
      var shown = 0;

      sortCards();

      cards.forEach(function (card) {
        var visible = matches(card);
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });

      if (visibleCount) {
        visibleCount.textContent = String(shown);
      }

      if (noResults) {
        noResults.classList.toggle('is-visible', shown === 0);
      }
    }

    [keywordInput, regionSelect, typeSelect, yearSelect, genreSelect, sortSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  function setupImageFallbacks() {
    document.addEventListener('error', function (event) {
      var target = event.target;

      if (!target || target.tagName !== 'IMG') {
        return;
      }

      var frame = target.closest('.poster-shell, .rank-poster');

      if (frame) {
        target.style.opacity = '0';
        frame.classList.add('is-missing');
      }
    }, true);
  }

  function setupBackToTop() {
    var button = document.querySelector('[data-back-to-top]');

    if (!button) {
      return;
    }

    function update() {
      button.classList.toggle('is-visible', window.scrollY > 480);
    }

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFiltering();
    setupImageFallbacks();
    setupBackToTop();
  });
})();
