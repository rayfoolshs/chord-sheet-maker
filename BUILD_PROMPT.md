# Build Prompt: Chord Sheet Studio

Build a "Chord Sheet Studio" web app.

Create a standalone, dependency-free web app (plain HTML/CSS/JS, no build step, no frameworks) that turns a chord progression into a printable A4 sheet containing guitar chord diagrams, keyboard diagrams with fingering, and a chord progression table. Open `index.html` directly in a browser.

## Files

- `index.html` — app shell, editor controls, preview container
- `chords.js` — music theory engine exposed as `window.ChordKit` (also UMD/CommonJS-compatible)
- `app.js` — UI state, rendering, persistence, event handling
- `styles.css` — warm paper aesthetic plus print styles

## Music engine (`chords.js`)

- Parse chord names: root `[A-G]` with `#`/`b`/`♯`/`♭`, optional slash bass, and quality suffixes.
- Supported qualities: major, minor, 7, maj7, m7, m9, maj9, 9, 6, m6, add9, madd9, sus2, sus4, dim, dim7, aug, 5. Accept aliases (`min`, `-`, `M7`, `Δ7`, `°`, `+`, `sus`, etc.).
- Spell chord tones correctly for the played key (letter + accidental, e.g. `Bb`, `F#`, `Ebb` where needed).
- Guitar: prefer curated open shapes (`OPEN_SHAPES`) for common chords; otherwise build movable E-shape or A-shape barre chords from interval templates, choosing the lowest-fret option, with automatic barre detection and sensible finger assignment.
- Keyboard: map chord tones to MIDI in a one-octave C4–B5 range, dedupe, sort ascending, and assign RH/LH fingering patterns (1-3-5 style for triads, up to 1-2-3-4-5 for larger chords).
- Export `parseChord`, `getGuitarShape`, `guitarNotes`, `getPianoVoicing`, `CHORD_SUGGESTIONS`.

## Editor UI

- Song title input (blank falls back to "Untitled Song").
- Segmented controls for "Chords per row" (1–8) and "Piano fingering" (RH/LH).
- A progression grid of inputs (up to 12 rows × 8 columns) with row numbers, per-row remove buttons, and an "Add row" button that disables at the limit.
- Typing validates chords live (invalid = red highlight + tooltip); on blur, normalize to canonical ASCII spelling.
- Space or Enter moves focus to the next slot, auto-adding a row at the end.
- Pasting a whitespace/comma/pipe-separated list of chords spreads them across the row, expanding columns as needed.
- Autocomplete via a `<datalist>` of suggestions.
- State persists to `localStorage` (`chord-sheet-studio:v1`), with a "Reset example" button (confirm first) and toast notifications.

## Live preview (A4 paper)

- Centered paper sheet with the song title, Guitar diagram section, a divider rule, Keyboard diagram section, a Chord Progression table, and a footer attributing "Created by Ray Foo" with a link to `www.rayfooproductions.com`.
- Show only unique chords (dedupe by root + quality + bass), up to 8 per grid row.
- Guitar cards: SVG fretboard (6 strings, 5 frets, nut, open/muted markers, finger-numbered dots, barre bars, `Nfr` label for higher positions), chord name and enharmonic note caption.
- Piano cards: SVG keyboard from C4 to B5 with black keys, red dots numbered with the chosen hand's fingering, chord name, note caption, and fingering caption.
- Graceful "No diagram" placeholder cards for unknown chords, and an empty-state panel when no chords exist.
- Progression table renders the actual rows/columns with canonical chord labels, bordered grid.

## Styling

- Warm cream/paper palette with a red accent, serif headings + clean sans body, soft shadows, rounded cards.
- Responsive layout: 3-column field grid → 2 → 1; scrollable progression editor; fluid diagram sizing via container queries (`cqw`) and CSS variables (`--cols`).
- Full `@media print` support for A4 portrait 12mm margins: hide header/editor, remove paper shadow/rounding, use point-based sizing, and avoid breaking cards/sections across pages. Honor `prefers-reduced-motion`.

## Quality bar

Accessible labels/ARIA on controls and SVGs, keyboard navigation, XSS-safe HTML escaping, no external assets or libraries, and no console errors.
