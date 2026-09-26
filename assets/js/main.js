/* Orchestrator for index.html */
(function () {
  var ready = Motion.setup();

  Content.loadPosts()
    .catch(function (e) { console.warn("posts:", e); return []; })
    .then(function (posts) {
      posts.sort(function (a, b) { return b.date.localeCompare(a.date); });
      Content.renderBlog(posts);
      Content.renderArticles(posts);
    })
    .then(function () {
      if (ready) Motion.init();
    });
})();
