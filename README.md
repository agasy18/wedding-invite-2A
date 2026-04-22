# Wedding Invite — Աղասի & Աննա

Static, personalized wedding invitation site. All HTML + React-via-CDN + Babel-in-browser — no build step, hosts anywhere that serves static files.

## Files

```
index.html          # main invite page (hero, countdown, schedule, venues, gallery, video, RSVP)
builder.html        # guest-link generator (internal tool, saves to localStorage)
sections.jsx        # the 7 section React components + confetti/reveal helpers
florals.jsx         # hand-drawn-feel floral SVG components + wreath + divider
styles.css          # palette + all section styles
favicon.svg         # site icon
.github/workflows/deploy.yml   # GitHub Pages deploy (no build — publishes the repo root)
```

## Run locally

Any static file server works. Easiest:

```bash
# Python 3
python3 -m http.server 8080

# Or Node (if you have it)
npx serve .
```

Then open:

- <http://localhost:8080/> — the invite
- <http://localhost:8080/builder.html> — the generator

## Personalized URLs

The invite reads one URL param:

| param | meaning | example |
|---|---|---|
| `name` | guest name (URL-encoded) | `?name=%D4%B1%D6%80%D5%A1%D5%B4` |

Open `builder.html` to generate these interactively. The builder also keeps a saved-guests list in the browser's localStorage (per device).

## Customize

- **Wedding date & names**: search `sections.jsx` and `index.html`. The date appears in the hero, countdown target (`new Date('2026-09-06T16:00:00+04:00')`), schedule, and footer.
- **Venue info**: `sections.jsx` → `ScheduleSection` and `VenuesSection` arrays.
- **YouTube video**: `sections.jsx` → `VideoSection`. Currently a click-to-reveal placeholder; swap the placeholder `<div>` for a real `<iframe>` if you want the embed.
- **RSVP submission**: `sections.jsx` → `RsvpSection`. Currently shows a confirmation UI with localStorage. To send to a Google Form, replace the `confirm()` handler with a `fetch()` to the form's `formResponse` endpoint, or swap the card for a pre-filled Google Form link.

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Settings → Pages → Source: **GitHub Actions**.
3. Workflow at `.github/workflows/deploy.yml` publishes the repo root on every push to `main`.
4. Visit `https://<user>.github.io/<repo>/`.

### Custom domain

Add a `CNAME` file at the repo root containing your domain, and set the DNS record per [GitHub's docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site).

## Performance note

This uses in-browser Babel to transform JSX at load time (`@babel/standalone`, ~1MB). That's fine for a wedding invite, but if you want to squeeze it:

1. Precompile `sections.jsx` and `florals.jsx` to `.js` with `npx babel --presets @babel/preset-react …`, and remove the `@babel/standalone` script tag.
2. Or switch to Vite + React for proper bundling.

Neither is necessary — as-is, the site works and looks right.
