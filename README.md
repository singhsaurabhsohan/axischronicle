# AxisChronicle

The media imprint of **SQUARGRAPH™**: original films, stories and articles, published at `axischronicle.squargraph.com`.

The site is a static site (no build step, no framework). It reuses the SQUARGRAPH design system from `squargraph.com` so both sites look and behave the same: colours, Satoshi typography, pill controls, navigation, sections and footer.

## How the design stays identical to squargraph.com

These files are copied **unchanged** from the `squargraph-site` repo. Do not edit them here; re-copy them when the main site changes.

| Copied file | Purpose |
| :--- | :--- |
| `fonts/` | Satoshi 400 / 500 / 700 |
| `assets/css/tokens.css`, `base.css`, `layout.css`, `components.css`, `animations.css` | Tokens, reset, nav, footer, buttons, forms |
| `assets/css/pages/home.css`, `home-studio.css`, `home-hero-v2.css`, `home-accent-consistency.css` | Homepage hero, section system, nav-over-hero |
| `assets/css/site-refresh.css`, `form-system.css` | Final palette overrides, footer, form system |
| `logo-g-v2.webp`, favicons, founder portrait | Brand assets |

Files specific to AxisChronicle:

| File | Purpose |
| :--- | :--- |
| `assets/css/axis.css` | Player, library, reader drawer, archive. Uses only SQUARGRAPH tokens. |
| `assets/js/site-nav.js` | Nav behaviour (extracted from the main site's `core.js`) |
| `assets/js/footer-map.js` | Footer "Business profile" block (extracted from the main site's `config.js`; no keys) |
| `assets/js/cinema-engine.js` | 8-second panel player, room tone, library, reader |
| `assets/data/library.json` | Everything published: films, stories, articles |
| `assets/data/baribari-panels.json`, `characters.json` | Production archive for BARIBARI |

Navigation and footer markup match `components/navigation.html.reference` and `components/footer.html.reference` on the main site, with absolute `https://squargraph.com/...` links. Two additions: a "Chronicle" item in the nav and an "AxisChronicle" link in the footer's Ecosystem column.

## Publishing new work

See `CONTENT_UPDATE_GUIDE.md`.

## Local preview

The page loads its data with `fetch`, so use a local server rather than opening the file directly:

```
python3 -m http.server 8765
```

## Deployment

Deploy the folder root to Cloudflare Pages (or Workers static assets) and bind `axischronicle.squargraph.com`. `_headers` carries the same security headers as the main site, adjusted for this site.

## Design rules (from the SQUARGRAPH guardrails)

Satoshi only. Ink `#1A1714`, Forest `#394536`, Moss `#657158`, cream `#F8F6F1`, muted gold `#B48A4A` used sparingly. Maximum 8px radius on cards, pill buttons and inputs, no italics, no purple, no decorative blobs. See the main site's `DESIGN_GUARDRAILS.md`.
