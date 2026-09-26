# Ilham Hasan Chowdhury, CFA — Portfolio

Static portfolio site (HTML/CSS/JS + GSAP + Lenis). No build step.

## Run locally
```
npx serve .
```

## Add a blog post or article
`content/posts.json` is currently empty, so the Blog and Articles sections are hidden. Add an object and they appear automatically (a section shows only when it has at least one post of its type):

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

## Deploy
Hosted on Vercel (static, no build). Pushing to `main` redeploys. GitHub Pages also serves the same branch.
