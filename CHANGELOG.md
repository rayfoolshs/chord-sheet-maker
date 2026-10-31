# Changelog

All notable changes to Chord Sheet Studio are recorded here. Versions follow
[Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).

The release number is defined once, in `<meta name="app-version">` in
`index.html`. `app.js` reads it and drives the page title, the header version
badge, and the brand link's accessible name, so bumping that meta tag is all
that is needed for a release. When releasing, also bump the `?v=` query string
on `styles.css`, `chords.js` and `app.js` in `index.html`; GitHub Pages caches
assets for ten minutes and the query string is what makes a new deploy visible
immediately.

## [1.3.2] - 2026-10-31

### Fixed

- Every iPad session now prints through the PDF path, not just the Home Screen
  app. Some iPadOS versions silently ignore `window.print()` in a Safari tab
  too, so tapping Print could appear to do nothing.
- The PDF result is now always visible: a preview of the generated page and a
  Download PDF link appear in the dialog, so there is a reliable fallback if the
  share sheet does not open.
- Toasts (such as "Link copied" or "If the PDF did not open…") now render above
  the dialog instead of behind it, which made some actions look like they did
  nothing.

## [1.3.1] - 2026-10-31

### Fixed

- Print / Save PDF now actually prints from an iPad Home Screen app instead of
  just explaining the limitation. The button rasterises the sheet and builds a
  one-page A4 PDF in the browser, then opens the iOS share sheet so you can
  choose **Print** or **Save to Files**. If sharing is unavailable it opens or
  downloads the PDF instead.
- The help dialog remains as a fallback with Open in Safari / Copy link if PDF
  generation or sharing fails.

### Added

- Vendored `html2canvas` 1.4.1 (MIT) for rendering the sheet to a PDF.

## [1.3.0] - 2026-10-31

### Fixed

- Print / Save PDF now explains itself on iPad when the app was added to the
  Home Screen. iPadOS does not give standalone web apps a print dialog, so the
  button previously did nothing; it now offers to open the sheet in a Safari
  tab, copy the link, or try printing anyway. Printing is unchanged in normal
  browser tabs.

## [1.2.2] - 2026-10-26

### Fixed

- Added CSS compatibility for browsers still holding a cached pre-1.2.1 page:
  its hidden-checkbox switch is hidden again and still slides, instead of
  showing up as a raw browser checkbox when the new stylesheet loads against
  the old markup.

## [1.2.1] - 2026-10-26

### Fixed

- The Guitar and Keyboard switches are now real `role="switch"` buttons, so the
  whole control is clickable/tappable and keyboard operable, instead of relying
  on label-plus-hidden-checkbox behaviour.
- Versioned asset URLs (`styles.css?v=1.2.1`, `chords.js?v=1.2.1`,
  `app.js?v=1.2.1`) so GitHub Pages' ten-minute cache can no longer serve an
  old script against a new page — the cause of switches that appeared but did
  nothing after a deploy.

## [1.2] - 2026-10-26

### Added

- **Guitar** and **Keyboard** toggle switches in the header, so either diagram
  section can be shown or hidden in both the live preview and the printed
  sheet. The choice is saved with the rest of the sheet state.

### Changed

- Printing is locked to a single A4 page: the sheet is measured before printing
  and scaled uniformly so diagrams, headings and the chord progression table
  all fit, and the progression always lands on that page.
- Diagram rows widen automatically for large chord sets (6, 7, or 8 per row
  above 20, 32, and 45 unique chords) so dense sheets stay legible instead of
  spilling onto a second page.
- `@page` margins now come from the sheet itself (12 mm), preventing a stray
  blank second page from rounding.

## [1.1] - 2026-10-26

### Changed

- Diagrams wrap five per row with even sizing, and the release version is shown
  in the heading.
- Added Ray Foo attribution to the app header and the printed sheet footer.

## [1.0.0] - 2026-10-24

### Added

- Initial release: chord progression editor, live A4 preview, guitar chord
  diagrams with fingering, keyboard diagrams with right/left-hand fingering,
  chord progression table, localStorage persistence, and print/PDF output.
