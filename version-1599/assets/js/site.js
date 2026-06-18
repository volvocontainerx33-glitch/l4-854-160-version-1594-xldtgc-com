document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mainNav = document.querySelector("[data-main-nav]");

  if (menuButton && mainNav) {
    menuButton.addEventListener("click", function () {
      mainNav.classList.toggle("is-open");
    });
  }

  var cards = document.querySelectorAll(".movie-card, .category-tile, .text-panel");
  cards.forEach(function (card, index) {
    card.style.animationDelay = String(Math.min(index * 20, 260)) + "ms";
  });
});
