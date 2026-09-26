/* Data-driven sections: blog cards and article list.
   Content lives in content/posts.json — edit that, not this file.
   A section with no posts is removed from the page (and the nav) automatically. */
(function () {
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmtDate(iso) {
    var d = new Date(iso + "T00:00:00");
    return isNaN(d) ? "" : d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  }
  function readTime(html) {
    var words = String(html || "").replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200)) + " min read";
  }
  function dropSection(id) {
    var s = document.getElementById(id);
    if (s) s.remove();
    document.querySelectorAll('a[href="#' + id + '"]').forEach(function (a) { a.remove(); });
  }
  function getJSON(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(url + " → " + r.status);
      return r.json();
    });
  }
  function media(post, i) {
    // deterministic abstract "chart" artwork so every card feels designed without image files
    var seed = (post.slug || "x").split("").reduce(function (a, c) { return a + c.charCodeAt(0); }, i * 7);
    var pts = [], x, y = 60 - (seed % 12);
    for (x = 0; x <= 320; x += 40) { y = Math.max(14, Math.min(96, y + ((seed * (x + 3)) % 23) - 12 - 3)); pts.push(x + "," + y); }
    var line = pts.join(" ");
    return '<div class="card-media" aria-hidden="true"><svg viewBox="0 0 320 110" preserveAspectRatio="none"><g stroke="#fff" stroke-opacity=".12"><path d="M0 27H320M0 55H320M0 83H320"/></g><polyline points="' + line + '" fill="none" stroke="#c4d5f3" stroke-width="2.5" stroke-linejoin="round"/><polygon points="0,110 ' + line + ' 320,110" fill="#fff" fill-opacity=".08"/></svg><span>' + esc(post.title.charAt(0)) + "</span></div>";
  }

  /* ---------- Blog ---------- */
  function renderBlog(posts) {
    var grid = document.getElementById("blogGrid");
    var filters = document.getElementById("filters");
    if (!grid) return;
    var blog = posts.filter(function (p) { return p.type === "blog"; });
    if (!blog.length) { dropSection("insights"); return; }
    var tags = ["All"].concat(blog.map(function (p) { return p.tag; }).filter(function (t, i, a) { return a.indexOf(t) === i; }));

    function draw(tag) {
      var list = blog.filter(function (p) { return tag === "All" || p.tag === tag; });
      grid.innerHTML = list.length ? list.map(function (p, i) {
        return '<article class="card" data-card>' + media(p, i) +
          '<div class="card-body"><div class="meta"><span class="tag">' + esc(p.tag) + "</span><span>" + fmtDate(p.date) + "</span><span>" + readTime(p.body) + "</span>" +
          (p.draft ? '<span class="draft">DRAFT</span>' : "") + "</div>" +
          '<h3><a class="stretch" href="post.html?slug=' + encodeURIComponent(p.slug) + '">' + esc(p.title) + "</a></h3>" +
          "<p>" + esc(p.excerpt) + '</p><span class="more">Read post ' + ARROW + "</span></div></article>";
      }).join("") : '<p class="empty">No posts in this topic yet.</p>';
      if (window.Motion) window.Motion.revealCards(grid.querySelectorAll("[data-card]"));
    }

    if (filters) {
      filters.innerHTML = tags.map(function (t, i) {
        return '<button class="filter" type="button" aria-pressed="' + (i === 0) + '" data-tag="' + esc(t) + '">' + esc(t) + "</button>";
      }).join("");
      filters.addEventListener("click", function (e) {
        var b = e.target.closest(".filter");
        if (!b) return;
        filters.querySelectorAll(".filter").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        draw(b.getAttribute("data-tag"));
      });
    }
    draw("All");
  }

  /* ---------- Articles ---------- */
  function renderArticles(posts) {
    var el = document.getElementById("articleList");
    if (!el) return;
    var list = posts.filter(function (p) { return p.type === "article"; });
    if (!list.length) { dropSection("articles"); return; }
    el.innerHTML = list.map(function (p) {
      return '<article class="article" data-reveal><div class="article-date">' + fmtDate(p.date) + "<small>" + readTime(p.body) + "</small></div>" +
        '<div><div class="meta"><span class="tag">' + esc(p.tag) + "</span>" + (p.draft ? '<span class="draft">DRAFT</span>' : "") + "</div>" +
        '<h3><a class="stretch" href="post.html?slug=' + encodeURIComponent(p.slug) + '">' + esc(p.title) + "</a></h3><p>" + esc(p.excerpt) + "</p></div>" +
        '<span class="arrow" aria-hidden="true">' + ARROW + "</span></article>";
    }).join("");
  }


  window.Content = {
    esc: esc, fmtDate: fmtDate, readTime: readTime,
    loadPosts: function () { return getJSON("content/posts.json"); },
    renderBlog: renderBlog, renderArticles: renderArticles
  };
})();
