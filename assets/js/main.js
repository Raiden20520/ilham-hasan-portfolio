/* Orchestrator for index.html */
(function () {
  var ready = Motion.setup();

  Promise.all([
    Content.loadPosts().catch(function (e) { console.warn("posts:", e); return []; }),
    Content.loadVideos().catch(function (e) { console.warn("videos:", e); return []; })
  ]).then(function (res) {
    var posts = res[0].sort(function (a, b) { return b.date.localeCompare(a.date); });
    Content.renderBlog(posts);
    Content.renderArticles(posts);
    Content.renderVideos(res[1]);
  }).then(function () {
    if (ready) Motion.init();
  });
})();
