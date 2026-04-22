# Wedding Invite — Աղասի & Աննա

Single-page Armenian wedding invitation built with Vite + React. Includes a companion guest-link builder. Hosted on GitHub Pages.

## Production

- **Invite**: <https://agasy18.github.io/wedding-invite-2A/>
- **Builder** (internal): <https://agasy18.github.io/wedding-invite-2A/builder.html>

## Files

```
index.html            # invite page shell
builder.html          # guest-link generator shell
src/
  main.jsx            # invite entry
  builder.jsx         # builder entry
  sections.jsx        # the 7 section components + helpers
  florals.jsx         # hand-drawn-feel floral SVG components
  nameCodec.js        # short-URL dictionary + base64url fallback
  builder.css         # builder-only styles
public/
  styles.css          # all shared palette + layout styles
  favicon.svg
vite.config.js
package.json
.github/workflows/deploy.yml
```

## Run locally

```bash
npm install
npm run dev
```

Vite prints a URL (usually `http://localhost:5173/`). The invite is `/`, the builder is `/builder.html`.

## Build

```bash
npm run build
```

Produces `dist/` ready to publish as static files.

## Personalized URLs

The invite reads one URL param:

| param | meaning | example |
|---|---|---|
| `n` | encoded guest name (short dict ID or `b.<base64url>`) | `?n=m71` or `?n=b.1LPVodWe1YjVuA` |
| `name` | legacy raw guest name (still supported) | `?name=Աղասի` |

Open `/builder.html` to generate URLs interactively. Common Armenian names are mapped to short IDs (`Աղասի` → `m71`, `Աննա` → `f88`, etc.). Non-dictionary names fall back to base64url-encoded UTF-8 — slightly longer but works for any name. To shorten more names, add them to `src/nameCodec.js`.

## Customize

- **Couple names + date**: `src/sections.jsx` (`HeroSection`, `CountdownSection`, `RsvpSection`)
- **Venues**: `src/sections.jsx` → `ScheduleSection` and `VenuesSection` arrays
- **Countdown target**: `src/sections.jsx` → `CountdownSection` (`new Date('2026-09-06T16:00:00+04:00')`)
- **Palette + typography**: `public/styles.css` (CSS variables at the top)
- **Page titles/favicon**: `index.html`, `builder.html`
- **YouTube video**: `src/sections.jsx` → `VideoSection` is a click-to-reveal placeholder; swap the placeholder `<div>` for a real `<iframe>` to embed.

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Settings → Pages → Source: **GitHub Actions**.
3. `.github/workflows/deploy.yml` runs `npm ci && npm run build` and publishes `dist/` on every push to `main`.
4. Visit `https://<user>.github.io/<repo>/`.

### Project-page URL (with `/<repo>/` prefix)

If your Pages URL is `https://<user>.github.io/wedding-invite-2A/`, assets will 404 because they resolve from `/`. Fix by setting `base: '/wedding-invite-2A/'` in `vite.config.js`.

### Custom domain

Add `public/CNAME` containing your domain, keep `base: '/'`, and set DNS per [GitHub's docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site).
