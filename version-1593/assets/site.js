(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        document.querySelectorAll('[data-menu-toggle]').forEach(function (button) {
            button.addEventListener('click', function () {
                var menu = document.querySelector('[data-mobile-menu]');
                if (menu) {
                    menu.classList.toggle('is-open');
                }
            });
        });

        document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
            var prev = carousel.querySelector('[data-hero-prev]');
            var next = carousel.querySelector('[data-hero-next]');
            var active = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === active);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === active);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(active + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(active - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    show(active + 1);
                    start();
                });
            }
            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
                    start();
                });
            });
            carousel.addEventListener('mouseenter', stop);
            carousel.addEventListener('mouseleave', start);
            show(0);
            start();
        });

        document.querySelectorAll('[data-page-filter]').forEach(function (input) {
            var section = input.closest('section') || document;
            var list = section.querySelector('[data-filter-list]') || document;
            var items = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));
            var counter = section.querySelector('[data-filter-count]');

            function applyFilter() {
                var query = input.value.trim().toLowerCase();
                var visible = 0;
                items.forEach(function (item) {
                    var haystack = (item.getAttribute('data-search') || '').toLowerCase();
                    var matched = !query || haystack.indexOf(query) !== -1;
                    item.classList.toggle('is-filtered-out', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (counter) {
                    counter.textContent = visible + ' 条结果';
                }
            }

            input.addEventListener('input', applyFilter);
        });
    });
})();
