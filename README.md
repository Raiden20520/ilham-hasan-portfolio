# Ilham Hasan Chowdhury, CFA — Portfolio

Static portfolio site (HTML/CSS/JS + GSAP + Lenis). No build step.

## Run locally
```
npx serve .
```

## Add a blog post or article
Edit `content/posts.json` and add an object:

```json
{
  "slug": "my-post",           // unique, used in the URL
  "type": "blog",              // "blog" or "article"
  "tag": "Execution",          // groups posts under filter chips
  "date": "2026-01-15",
  "title": "…",
  "excerpt": "One or two sentences for the card.",
  "draft": false,              // true shows a DRAFT badge
  "body": "<p>HTML body…</p>"
}
```

## Add a YouTube video
Edit `content/videos.json`. `id` accepts a full YouTube URL or the 11-character ID. The first entry is shown as the featured video. Videos only load when a visitor presses play (privacy-friendly `youtube-nocookie`).

## Deploy
GitHub Pages: repo **Settings → Pages → Deploy from a branch → `main` / `(root)`**.
