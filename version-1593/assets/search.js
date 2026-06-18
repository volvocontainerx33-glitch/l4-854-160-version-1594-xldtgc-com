(function () {
    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '' +
            '<article class="movie-card" data-search="' + escapeHtml([movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' ')].join(' ')) + '">' +
                '<a class="movie-card__poster" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="movie-card__play">立即播放</span>' +
                '</a>' +
                '<div class="movie-card__body">' +
                    '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p class="movie-card__meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>' +
                    '<p class="movie-card__line">' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</article>';
    }

    function getQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get('q') || '').trim();
    }

    function render(query) {
        var data = window.MOVIE_DATA || [];
        var results = document.getElementById('search-results');
        var counter = document.getElementById('search-count');
        if (!results) {
            return;
        }

        var normalized = query.trim().toLowerCase();
        var matched = data.filter(function (movie) {
            if (!normalized) {
                return true;
            }
            var haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.category,
                (movie.tags || []).join(' '),
                movie.oneLine,
                movie.summary
            ].join(' ').toLowerCase();
            return haystack.indexOf(normalized) !== -1;
        });

        var visible = matched.slice(0, 240);
        results.innerHTML = visible.map(card).join('');
        if (counter) {
            counter.textContent = normalized
                ? '找到 ' + matched.length + ' 条结果，当前显示 ' + visible.length + ' 条'
                : '共 ' + data.length + ' 部影片，当前显示 ' + visible.length + ' 条';
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        var input = document.querySelector('[data-search-input]');
        var form = document.querySelector('[data-search-form]');
        var query = getQuery();

        if (input) {
            input.value = query;
            input.addEventListener('input', function () {
                render(input.value);
            });
        }
        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var nextQuery = input ? input.value.trim() : '';
                var url = nextQuery ? 'search.html?q=' + encodeURIComponent(nextQuery) : 'search.html';
                window.history.replaceState(null, '', url);
                render(nextQuery);
            });
        }
        document.querySelectorAll('[data-quick-search]').forEach(function (button) {
            button.addEventListener('click', function () {
                var value = button.getAttribute('data-quick-search') || '';
                if (input) {
                    input.value = value;
                }
                window.history.replaceState(null, '', 'search.html?q=' + encodeURIComponent(value));
                render(value);
            });
        });

        render(query);
    });
})();
