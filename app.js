(function () {
  "use strict";

  const CK = window.ChordKit;
  const STORAGE_KEY = "chord-sheet-studio:v1";
  const MAX_COLUMNS = 8;
  const MAX_ROWS = 12;
  const DIAGRAMS_PER_ROW = 5;
  const MM_TO_PX = 96 / 25.4;
  /* Printed sheet box (A4 minus a 2 mm safety margin) in CSS pixels. */
  const PRINT_SHEET_HEIGHT_PX = 295 * MM_TO_PX;
  const VERSION_META = document.querySelector('meta[name="app-version"]');
  const APP_VERSION = (VERSION_META && VERSION_META.getAttribute("content")) || "1.2";

  const DEFAULT_STATE = {
    title: "I Got A Feeling",
    columns: 4,
    hand: "right",
    showGuitar: true,
    showKeyboard: true,
    rows: [
      makeRow(["G", "G", "C", "C"]),
      makeRow(["Em", "Em", "C", "C"])
    ]
  };

  const elements = {
    titleInput: document.getElementById("titleInput"),
    columnControl: document.getElementById("columnControl"),
    handControl: document.getElementById("handControl"),
    guitarToggle: document.getElementById("guitarToggle"),
    keyboardToggle: document.getElementById("keyboardToggle"),
    progressionEditor: document.getElementById("progressionEditor"),
    slotHint: document.getElementById("slotHint"),
    addRowBtn: document.getElementById("addRowBtn"),
    printBtn: document.getElementById("printBtn"),
    resetBtn: document.getElementById("resetBtn"),
    paper: document.getElementById("paper"),
    suggestions: document.getElementById("chordSuggestions"),
    toast: document.getElementById("toast")
  };

  let state = loadState();
  let updateFrame = null;
  let toastTimer = null;

  init();

  function init() {
    applyVersion();
    populateSuggestions();
    elements.titleInput.value = state.title;
    renderEditor();
    renderControls();
    renderChart();
    bindEvents();
  }

  /* Single source of truth for the release number: <meta name="app-version">. */
  function applyVersion() {
    const label = "Chord Sheet Studio v" + APP_VERSION;
    document.title = label;
    const badge = document.querySelector(".brand-version");
    if (badge) badge.textContent = "v" + APP_VERSION;
    const brand = document.querySelector(".brand");
    if (brand) brand.setAttribute("aria-label", label + " home");
  }

  function makeRow(values) {
    const row = Array.isArray(values) ? values.slice(0, MAX_COLUMNS) : [];
    while (row.length < MAX_COLUMNS) row.push("");
    return row.map(function (value) {
      return typeof value === "string" ? value : "";
    });
  }

  function cloneDefault() {
    return {
      title: DEFAULT_STATE.title,
      columns: DEFAULT_STATE.columns,
      hand: DEFAULT_STATE.hand,
      showGuitar: DEFAULT_STATE.showGuitar,
      showKeyboard: DEFAULT_STATE.showKeyboard,
      rows: DEFAULT_STATE.rows.map(function (row) { return row.slice(); })
    };
  }

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneDefault();
      const saved = JSON.parse(raw);
      const columns = clamp(Number(saved.columns) || 4, 1, MAX_COLUMNS);
      const rows = Array.isArray(saved.rows) && saved.rows.length
        ? saved.rows.slice(0, MAX_ROWS).map(makeRow)
        : cloneDefault().rows;
      return {
        title: typeof saved.title === "string" ? saved.title : DEFAULT_STATE.title,
        columns: columns,
        hand: saved.hand === "left" ? "left" : "right",
        showGuitar: saved.showGuitar !== false,
        showKeyboard: saved.showKeyboard !== false,
        rows: rows
      };
    } catch (error) {
      return cloneDefault();
    }
  }

  function persist() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      /* Storage is optional. */
    }
  }

  function populateSuggestions() {
    elements.suggestions.innerHTML = CK.CHORD_SUGGESTIONS.map(function (chord) {
      return '<option value="' + escapeHtml(chord) + '"></option>';
    }).join("");
  }

  function bindEvents() {
    elements.titleInput.addEventListener("input", function (event) {
      state.title = event.target.value;
      scheduleUpdate();
    });

    elements.titleInput.addEventListener("blur", function () {
      if (!state.title.trim()) {
        state.title = "Untitled Song";
        elements.titleInput.value = state.title;
      }
      scheduleUpdate();
    });

    elements.columnControl.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-columns]");
      if (!button) return;
      state.columns = clamp(Number(button.dataset.columns), 1, MAX_COLUMNS);
      renderEditor();
      renderControls();
      renderChart();
      persist();
    });

    elements.handControl.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-hand]");
      if (!button) return;
      state.hand = button.dataset.hand === "left" ? "left" : "right";
      renderControls();
      renderChart();
      persist();
    });

    elements.guitarToggle.addEventListener("change", function (event) {
      state.showGuitar = event.target.checked;
      renderChart();
      persist();
    });

    elements.keyboardToggle.addEventListener("change", function (event) {
      state.showKeyboard = event.target.checked;
      renderChart();
      persist();
    });

    elements.progressionEditor.addEventListener("input", function (event) {
      const input = event.target.closest(".chord-input");
      if (!input) return;
      const row = Number(input.dataset.row);
      const column = Number(input.dataset.col);
      state.rows[row][column] = input.value;
      validateInput(input);
      scheduleUpdate();
    });

    elements.progressionEditor.addEventListener("focusout", function (event) {
      const input = event.target.closest(".chord-input");
      if (!input) return;
      const row = Number(input.dataset.row);
      const column = Number(input.dataset.col);
      const value = input.value.trim();
      const chord = CK.parseChord(value);
      if (chord) {
        input.value = chord.ascii;
        state.rows[row][column] = chord.ascii;
      } else {
        input.value = value;
        state.rows[row][column] = value;
      }
      validateInput(input);
      scheduleUpdate();
    });

    elements.progressionEditor.addEventListener("keydown", function (event) {
      const input = event.target.closest(".chord-input");
      if (!input) return;
      if (event.key === " " && input.value.trim()) {
        event.preventDefault();
        focusAdjacentInput(input, 1);
      }
      if (event.key === "Enter") {
        event.preventDefault();
        focusAdjacentInput(input, 1);
      }
    });

    elements.progressionEditor.addEventListener("paste", function (event) {
      const input = event.target.closest(".chord-input");
      if (!input) return;
      const text = event.clipboardData ? event.clipboardData.getData("text") : "";
      const tokens = text.split(/[\s,|]+/).filter(Boolean);
      if (tokens.length < 2) return;
      event.preventDefault();

      const row = Number(input.dataset.row);
      const start = Number(input.dataset.col);
      const needed = start + tokens.length;
      if (needed > state.columns) {
        state.columns = clamp(needed, state.columns, MAX_COLUMNS);
        renderControls();
      }
      tokens.slice(0, MAX_COLUMNS - start).forEach(function (token, offset) {
        const parsed = CK.parseChord(token);
        state.rows[row][start + offset] = parsed ? parsed.ascii : token;
      });
      renderEditor();
      renderChart();
      persist();
      const nextInput = elements.progressionEditor.querySelector(
        '.chord-input[data-row="' + row + '"][data-col="' + start + '"]'
      );
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    });

    elements.progressionEditor.addEventListener("click", function (event) {
      const removeButton = event.target.closest(".row-remove");
      if (!removeButton) return;
      if (state.rows.length <= 1) return;
      const row = Number(removeButton.dataset.row);
      state.rows.splice(row, 1);
      renderEditor();
      renderChart();
      persist();
      showToast("Row removed");
    });

    elements.addRowBtn.addEventListener("click", function () {
      if (state.rows.length >= MAX_ROWS) {
        showToast("Up to " + MAX_ROWS + " rows");
        return;
      }
      state.rows.push(makeRow([]));
      renderEditor();
      renderChart();
      persist();
      const lastRow = state.rows.length - 1;
      const input = elements.progressionEditor.querySelector(
        '.chord-input[data-row="' + lastRow + '"][data-col="0"]'
      );
      if (input) input.focus();
    });

    elements.printBtn.addEventListener("click", function () {
      preparePrintFit();
      window.print();
    });

    window.addEventListener("beforeprint", preparePrintFit);

    elements.resetBtn.addEventListener("click", function () {
      if (!window.confirm("Reset the sheet to the example progression?")) return;
      state = cloneDefault();
      elements.titleInput.value = state.title;
      renderEditor();
      renderControls();
      renderChart();
      persist();
      showToast("Example restored");
    });
  }

  function focusAdjacentInput(current, direction) {
    const inputs = Array.from(elements.progressionEditor.querySelectorAll(".chord-input"));
    const index = inputs.indexOf(current);
    if (index === -1) return;
    const next = inputs[index + direction];
    if (next) {
      next.focus();
      next.select();
    } else if (direction > 0) {
      const row = Number(current.dataset.row);
      if (row === state.rows.length - 1 && state.rows.length < MAX_ROWS) {
        elements.addRowBtn.click();
      }
    }
  }

  function validateInput(input) {
    const value = input.value.trim();
    const valid = !value || Boolean(CK.parseChord(value));
    input.classList.toggle("is-invalid", !valid);
    if (valid) {
      input.removeAttribute("title");
    } else {
      input.title = "Chord name not recognised";
    }
  }

  function renderControls() {
    elements.columnControl.querySelectorAll("button").forEach(function (button) {
      const active = Number(button.dataset.columns) === state.columns;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    elements.handControl.querySelectorAll("button").forEach(function (button) {
      const active = button.dataset.hand === state.hand;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    elements.slotHint.textContent = state.columns + " slots per row";
    elements.addRowBtn.disabled = state.rows.length >= MAX_ROWS;
    elements.guitarToggle.checked = state.showGuitar;
    elements.keyboardToggle.checked = state.showKeyboard;
  }

  function renderEditor() {
    elements.progressionEditor.style.setProperty("--cols", state.columns);
    elements.progressionEditor.innerHTML = state.rows.map(function (row, rowIndex) {
      const inputs = [];
      for (let column = 0; column < state.columns; column += 1) {
        const value = row[column] || "";
        const invalid = value.trim() && !CK.parseChord(value.trim());
        inputs.push(
          '<input class="chord-input' + (invalid ? " is-invalid" : "") + '"' +
          ' type="text" value="' + escapeHtml(value) + '"' +
          ' data-row="' + rowIndex + '" data-col="' + column + '"' +
          ' list="chordSuggestions" autocomplete="off" spellcheck="false"' +
          ' maxlength="12" placeholder="' + (rowIndex === 0 && column === 0 ? "G" : "Chord") + '"' +
          ' aria-label="Row ' + (rowIndex + 1) + ", chord " + (column + 1) + '">'
        );
      }
      return (
        '<div class="progression-row">' +
          '<span class="bar-index" aria-hidden="true">' + (rowIndex + 1) + "</span>" +
          inputs.join("") +
          '<button class="row-remove" type="button" data-row="' + rowIndex + '"' +
            ' aria-label="Remove row ' + (rowIndex + 1) + '"' +
            (state.rows.length <= 1 ? " disabled" : "") + ">" +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>' +
          "</button>" +
        "</div>"
      );
    }).join("");
    renderControls();
  }

  function scheduleUpdate() {
    if (updateFrame) return;
    updateFrame = window.requestAnimationFrame(function () {
      updateFrame = null;
      renderChart();
      persist();
    });
  }

  function renderChart() {
    const visibleRows = state.rows.map(function (row) {
      return row.slice(0, state.columns).map(function (value) { return value.trim(); });
    });
    const trimmedRows = visibleRows
      .map(trimTrailing)
      .filter(function (row) { return row.some(Boolean); });

    const uniqueChords = [];
    const seen = new Set();
    trimmedRows.forEach(function (row) {
      row.forEach(function (value) {
        if (!value) return;
        const chord = CK.parseChord(value);
        const key = chord
          ? chord.rootPc + "|" + chord.qualityKey + "|" + (chord.bassPc === null ? "" : chord.bassPc)
          : "invalid|" + value.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          uniqueChords.push({ raw: value, chord: chord });
        }
      });
    });

    const title = state.title.trim() || "Untitled Song";
    const handLabel = state.hand === "left" ? "LH" : "RH";
    const handName = state.hand === "left" ? "left-hand" : "right-hand";
    const titleMarkup = '<h1 class="sheet-title">' + escapeHtml(title) + "</h1>";
    const footerMarkup =
      '<footer class="sheet-footer">' +
        "<span>Created by Ray Foo</span>" +
        '<span class="footer-dot" aria-hidden="true">·</span>' +
        '<a href="https://www.rayfooproductions.com" target="_blank" rel="noopener noreferrer">www.rayfooproductions.com</a>' +
      "</footer>";

    if (!uniqueChords.length) {
      const shown = [];
      if (state.showGuitar) shown.push("guitar");
      if (state.showKeyboard) shown.push("keyboard");
      const message = shown.length
        ? "Add a chord or two to the progression above to create " + shown.join(" and ") + " diagrams."
        : "Add a chord or two to the progression above to build the chord progression table.";
      elements.paper.innerHTML =
        '<div class="sheet-body">' +
          titleMarkup +
          '<div class="empty-sheet">' +
            '<span class="empty-chord" aria-hidden="true">G</span>' +
            "<h2>Your chart will appear here</h2>" +
            "<p>" + message + "</p>" +
          "</div>" +
        "</div>" +
        footerMarkup;
      preparePrintFit();
      return;
    }

    const progressionSection = renderProgression(trimmedRows);

    const guitarSection =
      '<section class="diagram-section" aria-labelledby="guitarHeading">' +
        '<div class="section-heading">' +
          '<h2 id="guitarHeading">Guitar</h2>' +
          '<span>Fretting fingers in dots · notes include enharmonic names</span>' +
        "</div>" +
        diagramGrid(uniqueChords, "guitar") +
      "</section>";

    const keyboardSection =
      '<section class="diagram-section" aria-labelledby="keyboardHeading">' +
        '<div class="section-heading">' +
          '<h2 id="keyboardHeading">Keyboard</h2>' +
          '<span>Numbers show suggested ' + handName + " fingering · notes include enharmonic names</span>" +
        "</div>" +
        diagramGrid(uniqueChords, "piano") +
      "</section>";

    const sections = [];
    if (state.showGuitar) sections.push(guitarSection);
    if (state.showKeyboard) sections.push(keyboardSection);

    elements.paper.innerHTML =
      '<div class="sheet-body">' +
        titleMarkup +
        sections.join('<div class="sheet-rule" aria-hidden="true"></div>') +
        progressionSection +
      "</div>" +
      footerMarkup;

    preparePrintFit();
  }

  /* Measure the sheet and shrink it (uniformly) so printing always lands on one A4 page. */
  function preparePrintFit() {
    const sheetBody = elements.paper.querySelector(".sheet-body");
    if (!sheetBody) {
      elements.paper.style.removeProperty("--print-zoom");
      return;
    }

    document.body.classList.add("is-fitting");
    const measured = sheetBody.scrollHeight;
    const footer = elements.paper.querySelector(".sheet-footer");
    const footerHeight = footer ? footer.offsetHeight : 0;
    document.body.classList.remove("is-fitting");

    if (!measured) {
      elements.paper.style.setProperty("--print-zoom", "1");
      return;
    }

    /* Printed sheet is 295mm tall with 12mm padding on each side; the footer sits at the bottom. */
    const available = PRINT_SHEET_HEIGHT_PX - 2 * (12 * MM_TO_PX) - footerHeight - 3 * MM_TO_PX;
    const zoom = clamp(available / measured, 0.25, 1);
    elements.paper.style.setProperty("--print-zoom", zoom.toFixed(3));
  }

  function renderProgression(rows) {
    if (!rows.length) return "";
    const columns = Math.max.apply(null, rows.map(function (row) { return row.length; }));
    const body = rows.map(function (row) {
      const cells = [];
      for (let column = 0; column < columns; column += 1) {
        const raw = row[column] || "";
        const chord = raw ? CK.parseChord(raw) : null;
        const label = chord ? chord.label : raw;
        cells.push('<td>' + escapeHtml(label) + "</td>");
      }
      return "<tr>" + cells.join("") + "</tr>";
    }).join("");

    return (
      '<section class="progression-section" aria-labelledby="progressionHeading">' +
        '<h2 id="progressionHeading">Chord Progression</h2>' +
        '<div class="progression-table-wrap">' +
          '<table class="progression-table" style="--cols:' + columns + '">' +
            "<tbody>" + body + "</tbody>" +
          "</table>" +
        "</div>" +
      "</section>"
    );
  }

  /* Keep big progressions to fewer diagram rows so they still print legibly on one page. */
  function diagramsPerRow(count) {
    if (count <= 20) return DIAGRAMS_PER_ROW;
    if (count <= 32) return 6;
    if (count <= 45) return 7;
    return 8;
  }

  function diagramGrid(items, type) {
    const perRow = diagramsPerRow(items.length);
    const columns = Math.min(perRow, items.length) || 1;
    const chunks = [];
    for (let index = 0; index < items.length; index += perRow) {
      chunks.push(items.slice(index, index + perRow));
    }
    return chunks.map(function (chunk) {
      const cells = chunk.map(function (item) {
        return type === "guitar"
          ? guitarCard(item.raw, item.chord)
          : pianoCard(item.raw, item.chord);
      }).join("");
      const pad = columns - chunk.length;
      const spacer = '<div class="grid-spacer" aria-hidden="true"></div>';
      return '<div class="chord-grid ' + type + '-grid" style="--cols:' + columns + '">' +
        cells + repeatMarkup(spacer, pad) + "</div>";
    }).join("");
  }

  function guitarCard(raw, chord) {
    if (!chord) {
      return invalidCard(raw, "guitar");
    }
    const shape = CK.getGuitarShape(chord);
    if (!shape) {
      return invalidCard(raw, "guitar");
    }
    const noteLabels = chord.notes.map(enharmonicLabel).join(" · ");
    return (
      '<article class="chord-card guitar-card" aria-label="' + escapeHtml(chord.label) + ' guitar chord. Notes ' + escapeHtml(noteLabels) + '">' +
        '<h3 class="chord-name">' + escapeHtml(chord.label) + "</h3>" +
        '<div class="diagram-wrap">' + renderGuitarSVG(shape, chord) + "</div>" +
        '<p class="note-caption">' + escapeHtml(noteLabels) + "</p>" +
      "</article>"
    );
  }

  function pianoCard(raw, chord) {
    if (!chord) {
      return invalidCard(raw, "piano");
    }
    const voicing = CK.getPianoVoicing(chord, state.hand);
    if (!voicing) {
      return invalidCard(raw, "piano");
    }
    const handLabel = voicing.hand === "left" ? "LH" : "RH";
    const noteLabels = voicing.notes.map(enharmonicLabel).join(" · ");
    return (
      '<article class="chord-card piano-card" aria-label="' + escapeHtml(chord.label) + " keyboard chord, notes " +
        escapeHtml(noteLabels) + ", " + handLabel + " fingering " + voicing.fingerText + '">' +
        '<div class="diagram-wrap">' + renderPianoSVG(voicing, chord) + "</div>" +
        '<h3 class="chord-name">' + escapeHtml(chord.label) + "</h3>" +
        '<p class="note-caption">' + escapeHtml(noteLabels) + "</p>" +
        '<p class="finger-caption">' + handLabel + " " + escapeHtml(voicing.fingerText) + "</p>" +
      "</article>"
    );
  }

  function invalidCard(raw, type) {
    return (
      '<article class="chord-card ' + type + '-card is-missing">' +
        '<h3 class="chord-name">' + escapeHtml(raw || "?") + "</h3>" +
        '<div class="missing-diagram">' +
          '<span>?</span>' +
          "<small>No diagram</small>" +
        "</div>" +
      "</article>"
    );
  }

  function renderGuitarSVG(shape, chord) {
    const width = 170;
    const height = 192;
    const left = 30;
    const right = 148;
    const top = 31;
    const bottom = 164;
    const fretCount = 5;
    const gap = (bottom - top) / fretCount;
    const stringGap = (right - left) / 5;
    const baseFret = shape.baseFret || 1;
    const parts = [];
    const stringX = function (index) { return left + index * stringGap; };
    const fretY = function (fret) {
      return top + (fret - baseFret + 0.5) * gap;
    };
    const lineTop = top;
    const lineBottom = bottom;

    parts.push('<svg class="guitar-svg" viewBox="0 0 ' + width + " " + height + '" role="img" aria-label="' +
      escapeHtml(chord.label) + " guitar chord diagram. Frets " + shape.frets.join(",") +
      ". Fingering " + shape.fingers.join(",") + '.">');

    for (let string = 0; string < 6; string += 1) {
      const x = stringX(string);
      const thickness = string === 0 ? 1.7 : string === 5 ? 0.9 : 1.15;
      parts.push('<line x1="' + x + '" y1="' + lineTop + '" x2="' + x + '" y2="' + lineBottom +
        '" stroke="#1e1d1a" stroke-width="' + thickness + '"></line>');
    }

    for (let fretLine = 0; fretLine <= fretCount; fretLine += 1) {
      const y = top + fretLine * gap;
      const isNut = fretLine === 0 && baseFret === 1;
      parts.push('<line x1="' + left + '" y1="' + y + '" x2="' + right + '" y2="' + y +
        '" stroke="#1e1d1a" stroke-width="' + (isNut ? 4.2 : 1.1) + '"' +
        (isNut ? ' stroke-linecap="round"' : "") + "></line>");
    }

    if (baseFret > 1) {
      parts.push('<text x="' + (left - 7) + '" y="' + (top + gap * 0.5 + 3.2) +
        '" text-anchor="end" class="fret-number">' + baseFret + "fr</text>");
    }

    shape.frets.forEach(function (fret, string) {
      const x = stringX(string);
      if (fret === -1) {
        parts.push('<g class="string-marker" stroke="#1e1d1a" stroke-width="1.6" stroke-linecap="round">' +
          '<line x1="' + (x - 4.4) + '" y1="11.6" x2="' + (x + 4.4) + '" y2="20.4"></line>' +
          '<line x1="' + (x + 4.4) + '" y1="11.6" x2="' + (x - 4.4) + '" y2="20.4"></line>' +
        "</g>");
      } else if (fret === 0) {
        parts.push('<circle cx="' + x + '" cy="16" r="4.7" fill="#fffdf8" stroke="#1e1d1a" stroke-width="1.5"></circle>');
      }
    });

    if (shape.barre) {
      const y = fretY(shape.barre.fret);
      const x1 = stringX(shape.barre.from) - 7;
      const x2 = stringX(shape.barre.to) + 7;
      parts.push('<rect x="' + x1 + '" y="' + (y - 8) + '" width="' + (x2 - x1) + '" height="16" rx="8" fill="#1e1d1a"></rect>');
      parts.push('<text x="' + ((x1 + x2) / 2) + '" y="' + (y + 3.5) +
        '" text-anchor="middle" class="barre-finger">' + (shape.barre.finger || 1) + "</text>");
    }

    shape.frets.forEach(function (fret, string) {
      if (fret <= 0) return;
      if (shape.barre && string >= shape.barre.from && string <= shape.barre.to && fret === shape.barre.fret) return;
      const x = stringX(string);
      const y = fretY(fret);
      parts.push('<circle cx="' + x + '" cy="' + y + '" r="9.2" fill="#fffdf8" stroke="#1e1d1a" stroke-width="1.5"></circle>');
      if (shape.fingers[string]) {
        parts.push('<text x="' + x + '" y="' + (y + 3.5) + '" text-anchor="middle" class="finger-number">' +
          shape.fingers[string] + "</text>");
      }
    });

    parts.push("</svg>");
    return parts.join("");
  }

  function renderPianoSVG(voicing, chord) {
    const whiteMidi = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79];
    const blackKeys = [
      { after: 0, midi: 61 },
      { after: 1, midi: 63 },
      { after: 3, midi: 66 },
      { after: 4, midi: 68 },
      { after: 5, midi: 70 },
      { after: 7, midi: 73 },
      { after: 8, midi: 75 },
      { after: 10, midi: 78 }
    ];
    const width = 280;
    const height = 122;
    const keyTop = 8;
    const keyHeight = 98;
    const whiteWidth = width / 12;
    const blackWidth = 13.5;
    const blackHeight = 59;
    const noteByMidi = new Map();
    voicing.notes.forEach(function (note) { noteByMidi.set(note.midi, note); });
    const parts = [];

    parts.push('<svg class="piano-svg" viewBox="0 0 ' + width + " " + height + '" role="img" aria-label="' +
      escapeHtml(chord.label) + " keyboard chord. Notes " + escapeHtml(voicing.noteText) +
      ". " + (voicing.hand === "left" ? "Left" : "Right") + "-hand fingering " +
      escapeHtml(voicing.fingerText) + '.">');

    whiteMidi.forEach(function (midi, index) {
      const x = index * whiteWidth;
      parts.push('<rect x="' + (x + 0.5) + '" y="' + keyTop + '" width="' + (whiteWidth - 1) +
        '" height="' + keyHeight + '" rx="2.2" fill="#fffdf8" stroke="#817d73" stroke-width="1"></rect>');
    });

    blackKeys.forEach(function (key) {
      const x = (key.after + 1) * whiteWidth - blackWidth / 2;
      parts.push('<rect x="' + x + '" y="' + keyTop + '" width="' + blackWidth +
        '" height="' + blackHeight + '" rx="1.8" fill="#1e1d1a"></rect>');
    });

    whiteMidi.forEach(function (midi, index) {
      const note = noteByMidi.get(midi);
      if (!note) return;
      const x = index * whiteWidth + whiteWidth / 2;
      const y = 84;
      parts.push('<g class="piano-note">' +
        '<circle cx="' + x + '" cy="' + y + '" r="8.4" fill="#c84b36" stroke="#fffdf8" stroke-width="1.4"></circle>' +
        '<text x="' + x + '" y="' + (y + 3.4) + '" text-anchor="middle" class="piano-finger">' + note.finger + "</text>" +
      "</g>");
    });

    blackKeys.forEach(function (key) {
      const note = noteByMidi.get(key.midi);
      if (!note) return;
      const x = (key.after + 1) * whiteWidth;
      const y = 42;
      parts.push('<g class="piano-note">' +
        '<circle cx="' + x + '" cy="' + y + '" r="7.4" fill="#c84b36" stroke="#fffdf8" stroke-width="1.3"></circle>' +
        '<text x="' + x + '" y="' + (y + 3.2) + '" text-anchor="middle" class="piano-finger">' + note.finger + "</text>" +
      "</g>");
    });

    parts.push("</svg>");
    return parts.join("");
  }

  function enharmonicLabel(note) {
    const sharpNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const flatNames = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    const sharp = sharpNames[note.pc];
    const flat = flatNames[note.pc];
    if (sharp === flat) {
      return note.name === sharp ? note.name : note.name + "/" + sharp;
    }
    if (note.name === flat) return flat + "/" + sharp;
    return sharp + "/" + flat;
  }

  function trimTrailing(row) {
    const copy = row.slice();
    while (copy.length && !copy[copy.length - 1]) copy.pop();
    return copy;
  }

  function repeatMarkup(markup, count) {
    let output = "";
    for (let index = 0; index < count; index += 1) output += markup;
    return output;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      elements.toast.classList.remove("is-visible");
    }, 2200);
  }
})();
