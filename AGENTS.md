# AGENTS.md

Working notes for anyone (human or agent) changing Chord Sheet Studio.

## Keep the docs current

- **`UPDATES.md` must be updated in the same change as any addition, removal or
  behaviour change.** Add a dated entry at the top, newest first. Say what was
  added, changed or removed — and specifically note anything removed so it is
  not silently lost.
- `CHANGELOG.md` is the released-version history. When a release is cut, move a
  summary into a new version section there.
- The release number lives in `<meta name="app-version">` in `index.html`.
  Bumping it drives the page title, the header badge and the brand link's
  accessible name. When releasing, also bump the `?v=` query strings on
  `styles.css`, `chords.js` and `app.js` in `index.html` (GitHub Pages caches
  assets for ten minutes).
- Update the Files table in `README.md` when files are added or removed.

## Ground rules

- No build step and no network dependencies. The one library, html2canvas, is
  vendored. Keep it that way.
- Any screen-only affordance in the preview (controls, hints, pickers) must be
  hidden for print, for the A4 fit measurement (`body.is-fitting`) and for the
  iPad PDF raster (`body.is-capturing`), and must not affect the print fit.
- Generated chord shapes must be checked against the chord's tones. `chords.js`
  is plain UMD and can be required from Node for validation.
- Persisted state is versioned under `chord-sheet-studio:v1` in
  `localStorage`; new keys must be validated on load and tolerate stale data.
- Section visibility (`showGuitar`, `showKeyboard`, `showProgression`) is saved
  with the sheet state and read back permissively, so older saves without the
  newer keys keep working. The Progression toggle controls the sheet's chord
  table only; it does not remove entries from the editor.
- Keep the paper aesthetic: ink, paper and muted colour tokens from `:root`.

## Verifying changes

```bash
node --check app.js && node --check chords.js
node -e 'const CK = require("./chords.js"); ...'   # shape/voice validation
python3 -m http.server 8000                        # manual check
```
