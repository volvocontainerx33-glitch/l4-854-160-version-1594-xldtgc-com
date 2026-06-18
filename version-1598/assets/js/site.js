(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMobileMenu();
    initHeroCarousel();
    initImageFallbacks();
    initLocalFilters();
    initSearchPage();
  });

  function initMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    if (slides.length <= 1) {
      return;
    }

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
      });
    });

    window.setInterval(function () {
      show(current + 1);
    }, 5000);
  }

  function initImageFallbacks() {
    var images = document.querySelectorAll('img');

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.display = 'none';
        var parent = image.closest('.poster-frame, .hero-slide, .ranking-hero-card, .mini-card, .category-cover-stack');
        if (parent) {
          parent.classList.add('image-missing');
        }
      }, { once: true });
    });
  }

  function initLocalFilters() {
    var scopes = document.querySelectorAll('[data-filter-scope]');

    scopes.forEach(function (scope) {
      var search = scope.querySelector('[data-local-search]');
      var region = scope.querySelector('[data-filter-region]');
      var type = scope.querySelector('[data-filter-type]');
      var year = scope.querySelector('[data-filter-year]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var count = scope.querySelector('[data-visible-count]');

      function apply() {
        var query = (search && search.value || '').trim().toLowerCase();
        var regionValue = region && region.value || '';
        var typeValue = type && type.value || '';
        var yearValue = year && year.value || '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var matched = true;

          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (regionValue && card.getAttribute('data-region') !== regionValue) {
            matched = false;
          }
          if (typeValue && card.getAttribute('data-type') !== typeValue) {
            matched = false;
          }
          if (yearValue && card.getAttribute('data-year') !== yearValue) {
            matched = false;
          }

          card.classList.toggle('is-hidden-by-filter', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      [search, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function initSearchPage() {
    var data = window.MOVIE_SEARCH_INDEX;
    var input = document.getElementById('searchQuery');
    var type = document.getElementById('searchType');
    var button = document.getElementById('searchButton');
    var results = document.getElementById('searchResults');
    var count = document.getElementById('searchCount');

    if (!Array.isArray(data) || !input || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function renderCard(item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a class="poster-frame" href="' + escapeHtml(item.detail) + '">',
        '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="poster-gradient"></span>',
        '    <span class="quality-badge">HD</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="card-meta-line">',
        '      <span>' + escapeHtml(item.year) + '</span>',
        '      <span>' + escapeHtml(item.region) + '</span>',
        '      <span>' + escapeHtml(item.type) + '</span>',
        '    </div>',
        '    <h3><a href="' + escapeHtml(item.detail) + '">' + escapeHtml(item.title) + '</a></h3>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="tag-row">' + tags + '</div>',
        '    <div class="card-footer-line">',
        '      <span class="rating">★ ' + escapeHtml(item.rating) + '</span>',
        '      <span>' + escapeHtml(item.category) + '</span>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function render() {
      var query = (input.value || '').trim().toLowerCase();
      var typeValue = type && type.value || '';
      var filtered = data.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.category, (item.tags || []).join(' '), item.oneLine].join(' ').toLowerCase();

        if (query && text.indexOf(query) === -1) {
          return false;
        }
        if (typeValue && item.type !== typeValue) {
          return false;
        }
        return true;
      }).slice(0, 120);

      results.innerHTML = filtered.map(renderCard).join('');
      if (count) {
        count.textContent = String(filtered.length);
      }
      initImageFallbacks();
    }

    input.addEventListener('input', render);
    if (type) {
      type.addEventListener('change', render);
    }
    if (button) {
      button.addEventListener('click', render);
    }
    render();
  }
})();
