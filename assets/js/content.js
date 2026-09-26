/* Data-driven sections: blog cards, article list, YouTube facades.
   Content lives in content/posts.json and content/videos.json — edit those, not this file. */
(function () {
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';

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
    el.innerHTML = list.map(function (p) {
      return '<article class="article" data-reveal><div class="article-date">' + fmtDate(p.date) + "<small>" + readTime(p.body) + "</small></div>" +
        '<div><div class="meta"><span class="tag">' + esc(p.tag) + "</span>" + (p.draft ? '<span class="draft">DRAFT</span>' : "") + "</div>" +
        '<h3><a class="stretch" href="post.html?slug=' + encodeURIComponent(p.slug) + '">' + esc(p.title) + "</a></h3><p>" + esc(p.excerpt) + "</p></div>" +
        '<span class="arrow" aria-hidden="true">' + ARROW + "</span></article>";
    }).join("");
  }

  /* ---------- YouTube ---------- */
  function videoId(v) {
    var s = String(v.id || v.url || "");
    var m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || s.match(/^([\w-]{11})$/);
    return m ? m[1] : null;
  }
  function renderVideos(videos) {
    var grid = document.getElementById("videoGrid");
    if (!grid) return;
    grid.innerHTML = videos.map(function (v, i) {
      var id = videoId(v);
      var frame = id
        ? '<div class="video-frame" data-yt="' + id + '" style="background-image:url(https://i.ytimg.com/vi/' + id + '/hqdefault.jpg)"><button class="video-play" type="button" aria-label="Play video: ' + esc(v.title) + '"><i>' + PLAY + "</i></button></div>"
        : '<div class="video-frame video-placeholder"><div><b>Your video goes here</b><small>Add a YouTube link in content/videos.json</small></div></div>';
      return '<article class="video' + (i === 0 ? " is-featured" : "") + '" data-reveal>' + frame +
        '<div class="video-info"><span class="tag">' + esc(v.tag || "Video") + "</span><h3>" + esc(v.title) + "</h3><p>" + esc(v.description || "") + "</p></div></article>";
    }).join("");

    grid.addEventListener("click", function (e) {
      var btn = e.target.closest(".video-play");
      if (!btn) return;
      var frame = btn.parentElement;
      var id = frame.getAttribute("data-yt");
      frame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    });
  }

  window.Content = {
    esc: esc, fmtDate: fmtDate, readTime: readTime,
    loadPosts: function () { return getJSON("content/posts.json"); },
    loadVideos: function () { return getJSON("content/videos.json"); },
    renderBlog: renderBlog, renderArticles: renderArticles, renderVideos: renderVideos
  };
})();
