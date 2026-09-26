/* Motion layer: Lenis smooth scroll + GSAP/ScrollTrigger choreography.
   Every effect is gated on `active` (GSAP loaded and no reduced-motion preference). */
(function () {
  var active = false;
  var lenis = null;
  var batches = [];

  function isFinePointer() { return window.matchMedia("(hover: hover) and (pointer: fine)").matches; }

  function finalState() {
    // No-motion fallback: show everything in its end state.
    document.documentElement.classList.remove("has-motion");
    document.querySelectorAll("[data-count]").forEach(function (el) {
      el.textContent = Number(el.dataset.count).toFixed(Number(el.dataset.decimals || 0));
    });
    var pre = document.querySelector(".preloader");
    if (pre) pre.remove();
  }

  function setup() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    active = !!(window.gsap && window.ScrollTrigger) && !reduce;
    if (!active) { finalState(); return false; }
    gsap.registerPlugin(ScrollTrigger);
    return true;
  }

  /* Wrap each word of [data-split] in a masked span so it can slide up. */
  function splitWords(el) {
    var nodes = Array.prototype.slice.call(el.childNodes);
    el.textContent = "";
    var words = [];
    function push(content) {
      var w = document.createElement("span");
      w.className = "w";
      var inner = document.createElement("span");
      if (typeof content === "string") inner.textContent = content; else inner.appendChild(content);
      w.appendChild(inner);
      el.appendChild(w);
      el.appendChild(document.createTextNode(" "));
      words.push(inner);
    }
    nodes.forEach(function (n) {
      if (n.nodeType === 3) n.textContent.split(/\s+/).filter(Boolean).forEach(push);
      else push(n);
    });
    return words;
  }

  function heroIntro() {
    var title = document.querySelector("[data-split]");
    var words = title ? splitWords(title) : [];
    if (words.length) gsap.set(words, { yPercent: 110 });
    var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    var chartLine = document.querySelector(".chart-line");
    if (chartLine) {
      var len = chartLine.getTotalLength();
      gsap.set(chartLine, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(".chart-area", { opacity: 0 });
      gsap.set(".chart-dots circle", { scale: 0, transformOrigin: "50% 50%", transformBox: "fill-box" });
      tl.to(chartLine, { strokeDashoffset: 0, duration: 2.6, ease: "power2.inOut" }, 0)
        .to(".chart-area", { opacity: 1, duration: 1.8, ease: "power1.out" }, 0.6)
        .to(".chart-dots circle", { scale: 1, duration: 0.6, stagger: 0.25, ease: "back.out(3)" }, 1.2);
    }
    if (words.length) tl.fromTo(words, { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.09 }, 0.15);
    tl.to("[data-hero-item]", { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.5);
    return tl;
  }

  function preloader() {
    var pre = document.querySelector(".preloader");
    if (!pre) { heroIntro(); return; }
    var done = false;
    function finish() {
      if (done) return; done = true;
      heroIntroDelayed();
    }
    function heroIntroDelayed() {
      gsap.to(pre, { yPercent: -100, duration: 0.9, ease: "power4.inOut", onComplete: function () { pre.remove(); } });
      gsap.delayedCall(0.35, heroIntro);
    }
    gsap.to(".preloader-bar i", { scaleX: 1, duration: 0.9, ease: "power2.inOut", onComplete: finish });
    gsap.from(".preloader-mark", { opacity: 0, y: 14, duration: 0.6, ease: "power3.out" });
    setTimeout(finish, 3500); // failsafe
  }

  function smoothScroll() {
    if (!window.Lenis) return;
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);

    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      var target = id === "#top" ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: id === "#top" ? 0 : -60, duration: 1.4 });
    });

    var nav = document.getElementById("nav");
    lenis.on("scroll", function (s) {
      if (!nav) return;
      var hide = s.direction === 1 && s.scroll > 500 && !nav.classList.contains("menu-open");
      nav.classList.toggle("is-hidden", hide);
    });
  }

  function reveals() {
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 88%",
      once: true,
      onEnter: function (els) {
        gsap.to(els, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "power3.out", overwrite: true });
      }
    });
  }

  function counters() {
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var end = Number(el.dataset.count), dec = Number(el.dataset.decimals || 0), o = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: "top 90%", once: true,
        onEnter: function () {
          gsap.to(o, { v: end, duration: 2, ease: "power3.out", onUpdate: function () { el.textContent = o.v.toFixed(dec); } });
        }
      });
    });
  }

  function timelineRail() {
    var tl = document.getElementById("timeline");
    if (!tl) return;
    gsap.to(".timeline-rail i", {
      scaleY: 1, ease: "none",
      scrollTrigger: { trigger: tl, start: "top 60%", end: "bottom 70%", scrub: 0.4 }
    });
    tl.querySelectorAll(".role").forEach(function (role) {
      var lis = role.querySelectorAll("li");
      gsap.from(lis, {
        opacity: 0, x: -14, duration: 0.6, stagger: 0.09, ease: "power2.out",
        scrollTrigger: { trigger: role, start: "top 75%", once: true }
      });
    });
  }

  function progressAndNav() {
    gsap.to(".progress i", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.2 } });
    var links = document.querySelectorAll(".nav-links a");
    links.forEach(function (a) {
      var sec = document.querySelector(a.getAttribute("href"));
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec, start: "top 50%", end: "bottom 50%",
        onToggle: function (self) { a.classList.toggle("is-current", self.isActive); }
      });
    });
    gsap.to(".hero-chart", { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero-card", { yPercent: -8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  }

  function pointerFx() {
    if (!isFinePointer()) return;
    var cursor = document.querySelector(".cursor");
    if (cursor) {
      var cx = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
      var cy = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
      window.addEventListener("pointermove", function (e) { cursor.classList.add("is-active"); cx(e.clientX); cy(e.clientY); }, { passive: true });
      document.addEventListener("pointerover", function (e) {
        cursor.classList.toggle("is-hover", !!e.target.closest("a, button, [data-magnetic]"));
      });
      document.documentElement.addEventListener("mouseleave", function () { cursor.classList.remove("is-active"); });
    }
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var mx = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
      var my = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.28);
        my((e.clientY - (r.top + r.height / 2)) * 0.4);
      });
      el.addEventListener("pointerleave", function () { mx(0); my(0); });
    });
  }

  function init() {
    if (!active) return;
    smoothScroll();
    preloader();
    reveals();
    counters();
    timelineRail();
    progressAndNav();
    pointerFx();
    ScrollTrigger.refresh();
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }

  /* Scroll-in for dynamically rendered cards (also re-run after each filter change). */
  function revealCards(nodes) {
    if (!active || !nodes || !nodes.length) return;
    batches.forEach(function (b) { b.forEach(function (t) { t.kill(); }); });
    batches = [];
    gsap.set(nodes, { opacity: 0, y: 30 });
    batches.push(ScrollTrigger.batch(nodes, {
      start: "top 92%", once: true,
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", overwrite: true }); }
    }));
  }

  window.Motion = { setup: setup, init: init, revealCards: revealCards };
})();
