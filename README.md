# AxisChronicle — Arthouse Cinema Platform & Storytelling Engine

> **AxisChronicle**: An independent, original intellectual property (IP) created by **SQUARGRAPH™** and filmmaker **Saurabh Sohan Singh**.

---

## 📽️ Overview

AxisChronicle is engineered as a hybrid between a curated cinema streaming platform (such as MUBI) and a minimalist design archive. The core product consists of atmospheric, slow-burn psychological thrillers and surreal narratives structured in a distinct visual format: **long-form films assembled frame-by-frame out of precise eight-second cinematic panels paired with deep voiceover narration and spatial room-tone**.

---

## 💎 Design Alignment with SQUARGRAPH™ Guardrails

The website strictly complies with the latest **SQUARGRAPH Brand Guidelines and Design Guardrails** (from the October 2026 playbook and codebase backup):

1. **Typography**:
   - Satoshi only (`Regular 400`, `Medium 500`, `Bold 700`).
   - Zero letter-spacing in compact UI and body text.
   - Tight tracking (`-.045em` to `-.065em`) on large display headlines.
   - Zero italics in copy.
2. **Color Palette**:
   - Canvas: Pitch Black (`#070807` / `#050605`)
   - Surface / Panels: Deep Obsidian (`#0E110E` / `#131713`)
   - Paper / Text: `#FAFAF9`
   - Accents: Electric Sage (`#D8E9A1`), SQUARGRAPH Forest (`#1C3025`), Moss (`#657158`), Muted Gold (`#B48A4A` used sparingly).
   - Zero purple tones, zero fake glassmorphism, zero decorative blobs.
3. **Card & Border Discipline**:
   - Maximum corner radius: 8px.
   - Hairline borders: `rgba(250, 250, 249, 0.14)`.
   - Cards are never nested inside cards.
4. **Brand Attribution**:
   - Official SQUARGRAPH™ open-diamond emblem (polygon without inner ending stroke).
   - Uncompromising trademark adherence: `SQUARGRAPH™`.

---

## 🚀 Live Features & Engine Capabilities

| Feature | Description |
| :--- | :--- |
| **8-Second Cinema Stage** | Interactive continuous playback engine for flagship original *BARIBARI*. Each panel holds for exactly 8 seconds with dynamic visual atmosphere, live countdown ring, and real-time teleprompter readout. |
| **8-Second Scrubber Deck** | Calibrated film scrubber with 8-second tick intervals allowing instantaneous frame-jumping across all 75 panels. Includes keyboard shortcuts (`Space`, `←`, `→`, `F`, `M`). |
| **Web Audio Ambient Engine** | Built-in analog room-tone synthesizer (55Hz sub-harmonic drone and warm atmospheric harmonics) creating an immersive cinema environment upon user gesture. |
| **Interactive Screenplay Archive** | Complete 75-panel production script with camera directions, scene slugs, and timecodes. Clicking any panel jumps immediately to that frame in the player. |
| **Character Continuity Bible** | Verified character specifications for Saurabh, Baribari, and the Women at the Great House. |
| **Written Archive & Editorial Drawer** | Slide-over reading room featuring 4 in-depth architectural essays on neuro-cinematics, spatial audio, and the *Anti-Feed Manifesto*. |
| **Curatorial Screener Dialog** | Accessible modal for film festival programmers, curators, and critics to request private full-cut screener credentials. |

---

## 📁 Directory Structure

```
axischronicle/
├── index.html                    # Complete standalone production page
├── README.md                     # Architectural documentation
├── assets/
│   ├── css/
│   │   └── axis-theme.css        # SQUARGRAPH design system, tokens & layouts
│   ├── js/
│   │   └── cinema-engine.js      # 8s panel player, Web Audio drone, drawer
│   ├── data/
│   │   ├── baribari-panels.json  # 75 structured panels for flagship original
│   │   ├── characters.json       # Character continuity bible
│   │   └── editorial.json        # 4 architectural essays & field notes
│   ├── fonts/
│   │   ├── Satoshi-Regular.woff  # Embedded local Satoshi typeface
│   │   ├── Satoshi-Medium.woff
│   │   └── Satoshi-Bold.woff
│   └── logo/
│       ├── axischronicle-logo.svg
│       ├── axischronicle-mark.svg
│       ├── axischronicle-favicon.svg
│       └── squargraph_g_no_inner_ending.svg
```

---

## 🖥️ Local Preview & Verification

To preview the platform locally, open [`index.html`](file:///C:/Users/Rentorzo/.gemini/antigravity/scratch/axischronicle/index.html) in any modern web browser:
```powershell
Start-Process "C:\Users\Rentorzo\.gemini\antigravity\scratch\axischronicle\index.html"
```
Or serve via any static file server (e.g. `npx serve`, Python `http.server`, or VS Code Live Server).

---

## 🌐 Deployment

### Subdomain Deployment (`axischronicle.squargraph.com`):
Deploy the `axischronicle` directory to **Cloudflare Pages** or **Vercel**:
1. Drop the `axischronicle` folder into [Vercel Drop](https://vercel.com/drop) or link to a dedicated git repository.
2. In Project Settings → Domains, bind `axischronicle.squargraph.com`.
3. Set the CNAME record in your Cloudflare DNS dashboard pointing to your deployment target.
