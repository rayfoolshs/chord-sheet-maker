# Updates

A running log of what has been added, changed or removed in Chord Sheet Studio.
Newest entry first. `CHANGELOG.md` stays the released-version history; this file
records the work itself, including changes that are not released yet.

**Keep this file current: every time a feature, file, shape or behaviour is added
or removed, add an entry here in the same change.** Note removals explicitly so
nothing disappears silently.

---

## 2026-11-07 — v1.4.2 (released, published to GitHub Pages)

### Added

- A third header toggle, **Progression**, sits beside the Guitar and Keyboard
  toggles and shows or hides the Chord Progression table on the sheet. The
  choice is persisted with the rest of the state and restored on reload.

### Changed

- The empty-sheet message now names only the sections that are currently
  switched on, and prompts the user to enable a section when all three are off.
- Version bumped to **1.4.2** in `index.html` (meta tag, title, brand badge,
  fallback in `app.js` and the `?v=` asset query strings) so GitHub Pages
  serves the new scripts immediately. `README.md` and `CHANGELOG.md` record
  the release.

### Removed

- Nothing removed.

---

## 2026-11-01 — v1.4.1 (released, published to GitHub Pages)

### Fixed

- `app.js` had a stale `1.3.2` fallback for `APP_VERSION` (used only when the
  version meta tag is missing). It now matches the release, and the `?v=` asset
  query strings were bumped to 1.4.1 so browsers pick up the new script.
- `index.html`, `README.md` and `CHANGELOG.md` carry the 1.4.1 version.

### Removed

- Nothing removed.

---

## 2026-11-01 — v1.4.0 (released, published to GitHub Pages)

### Added

**Chord shape picker**

- Every guitar diagram in the live preview now has a dropdown beneath it listing
  every voicing that plays that chord; the diagram redraws with the right fret
  window, barre and finger numbers. The picker never prints and never appears in
  the iPad PDF.
- Movable barre voicings: E-shape and A-shape forms at the root position, plus the
  octave-up position when it still fits on the neck.
- Four-string voicings on the D G B E strings: up to two compact root-position
  shapes per chord, generated from the chord's own tones inside a four-fret
  window. They keep the third and colour tones (6th, 7th, 9th) and are scored for
  the tightest stretch.
- Three-string voicings on D G B and G B E, one per inversion (root, 1st, 2nd,
  and 3rd where a seventh is in the bass). A voicing must keep the root and every
  character tone, so an inversion reads as the same chord with a different bass.
- Chosen voicings persist per chord identity (`root|quality|bass`) in
  `localStorage` with the rest of the sheet; "Reset example" clears them.

**No chord (NC)**

- `NC`, `N.C.` and "no chord" are accepted in any progression slot, validate
  without the red error state, and normalise to `NC` on blur.
- `NC` is the first entry in the chord suggestions list.
- A bar marked NC renders an empty guitar fretboard and an empty keyboard: no
  chord title, no dots, no X/O markers, no note or fingering captions. Repeated
  NC entries collapse into one diagram, like repeated chords.

**Repo**

- `UPDATES.md` — this file.
- `AGENTS.md` — maintenance rules, including keeping this log current.

### Changed

- `chords.js` exports `getGuitarVoicings(chord)` (every shape, default first),
  `isNoChord(value)`, and a shared partial-shape builder for the 3- and 4-string
  fingerings, including partial-barre detection. `getGuitarShape` still returns
  the default shape.
- `chords.js` `CHORD_SUGGESTIONS` starts with `"NC"`.
- `app.js` keys chart entries by chord identity, renders the picker, treats NC as
  valid input, and renders the empty NC diagrams.
- `app.js` hides pickers and the NC alignment spacer during A4 measurement
  (`is-fitting`) and during HTML-to-canvas PDF capture (`is-capturing`).
- The printed Chord Progression table leaves NC cells blank instead of printing
  "NC".
- Guitar section hint now reads "pick a shape under each diagram"; the editor
  hint mentions `NC`.
- `styles.css` gains picker styling (pill select), the print/measurement/capture
  hiding rules, the no-chord hidden-title rules, and a smaller picker font at the
  narrow breakpoint.
- `README.md` and `CHANGELOG.md` document both features, and the README Files
  table lists `UPDATES.md` and `AGENTS.md`.
- Version bumped to **1.4.0** in `index.html` (meta tag, title, brand badge and
  the `?v=` asset query strings).

### Removed

- The first version of the NC diagrams printed an "N.C." heading above the
  guitar neck and below the keyboard. That title was removed on request: both NC
  cards now print nothing. The blank name/caption space is kept for alignment,
  plus a screen-only spacer so the empty neck sits level with cards that show a
  picker.
- `findGuitarVoicing` was added and then dropped during development; it never
  shipped.

### Verified

- All generated voicings for every root × quality (2,081 shapes) were checked:
  no note outside the chord, every shape contains the root, no duplicate labels.
- Voicing choices round-trip through `localStorage` across reloads.
- Picker and alignment spacer are `display: none` in print, during A4
  measurement and during PDF capture; all guitar cards measure the same height.
- NC input normalises, validates, renders empty diagrams with no visible title,
  and leaves the progression table cell blank.
- No console errors while changing voicings, entering NC or reloading.
