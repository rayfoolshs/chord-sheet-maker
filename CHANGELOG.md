# Changelog

All notable changes to Chord Sheet Studio are recorded here. Versions follow
[Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).

The release number is defined once, in `<meta name="app-version">` in
`index.html`. `app.js` reads it and drives the page title, the header version
badge, and the brand link's accessible name, so bumping that meta tag is all
that is needed for a release.

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
