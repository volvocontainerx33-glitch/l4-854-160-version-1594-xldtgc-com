document.addEventListener("DOMContentLoaded", function () {
  var input = document.getElementById("site-search-input");
  var clearButton = document.getElementById("site-search-clear");
  var status = document.getElementById("site-search-status");
  var results = document.getElementById("site-search-results");
  var data = window.SITE_SEARCH_DATA || [];

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function render(items, query) {
    results.innerHTML = "";

    if (!query) {
      status.textContent = "请输入关键词开始搜索。";
      return;
    }

    status.textContent = "找到 " + items.length + " 条相关结果。";

    if (!items.length) {
      results.innerHTML = '<div class="text-panel"><p>没有找到匹配内容，请尝试更短的关键词。</p></div>';
      return;
    }

    items.slice(0, 80).forEach(function (item) {
      var card = document.createElement("a");
      card.className = "search-result-card";
      card.href = item.url;
      card.innerHTML = [
        "<h2>" + escapeHtml(item.title) + "</h2>",
        "<p>" + escapeHtml(item.oneLine || "") + "</p>",
        '<div class="result-meta">',
        "<span>" + escapeHtml(item.region) + "</span>",
        "<span>" + escapeHtml(item.type) + "</span>",
        "<span>" + escapeHtml(item.year) + "</span>",
        "<span>" + escapeHtml(item.category) + "</span>",
        "</div>"
      ].join("");
      results.appendChild(card);
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function runSearch() {
    var query = normalize(input.value);

    if (!query) {
      render([], "");
      return;
    }

    var terms = query.split(/\s+/).filter(Boolean);
    var matched = data.filter(function (item) {
      var haystack = normalize([
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.category,
        (item.tags || []).join(" "),
        item.oneLine
      ].join(" "));

      return terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    });

    render(matched, query);
  }

  if (input) {
    input.addEventListener("input", runSearch);
  }

  if (clearButton) {
    clearButton.addEventListener("click", function () {
      input.value = "";
      input.focus();
      runSearch();
    });
  }
});
