# Content update guide

All publishable content lives in `assets/data/library.json`. Add an object to the array and the library, filters and counts update automatically. No HTML changes are needed.

## Fields

| Field | Used by | Notes |
| :--- | :--- | :--- |
| `id` | all | Unique, lowercase, hyphenated. Becomes the share link `#read=<id>`. |
| `type` | all | `film`, `story` or `article` |
| `title`, `subtitle` | all | Subtitle is optional |
| `category` | all | Short label, for example `Original film`, `Field note` |
| `date` | all | Display text, for example `October 2026` |
| `excerpt` | all | One to three sentences shown on the card |
| `cover` | all | Optional image path or `https://` URL, 16:9 |
| `featured` | film | `true` shows the card full width at the top |
| `duration` | film | For example `34:00` |
| `embed` | film | Optional `https://` player URL (Gumlet, YouTube or Vimeo embed). When set, the card opens a video dialog. When empty, the card scrolls to the on-page player. |
| `content` | story, article | Array of paragraphs, shown in the reader |
| `readTime`, `author`, `role`, `number` | story, article | Shown in the reader header |

## Add a film

```json
{
  "id": "baribari-episode-2",
  "type": "film",
  "title": "BARIBARI",
  "subtitle": "Episode 2",
  "category": "Original film",
  "date": "November 2026",
  "duration": "28:00",
  "excerpt": "One or two sentences.",
  "embed": "https://play.gumlet.io/embed/<video-id>",
  "cover": "/assets/images/ep2-cover.webp"
}
```

## Add a story or article

```json
{
  "id": "field-note-005",
  "type": "article",
  "title": "Title",
  "subtitle": "One-line summary",
  "category": "Field note",
  "date": "November 2026",
  "readTime": "5 min read",
  "author": "Saurabh Sohan Singh",
  "role": "Creator & Filmmaker, SQUARGRAPH™",
  "excerpt": "Card summary.",
  "content": ["First paragraph.", "Second paragraph."]
}
```

Use `"type": "story"` for fiction and narrative pieces.

## Copy rules

Follow the main site's guardrails: restrained and precise voice, no inflated claims, write SQUARGRAPH™ with the trademark symbol, and keep the SQUARGRAPH client work separate from AxisChronicle's creative work.

## Images

Use WebP, set a 16:9 ratio, and keep files under about 150 KB. Store them in `assets/images/`.
